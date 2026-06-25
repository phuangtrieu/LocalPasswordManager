/* ============================================
   Google Sheets API Integration
   Uses Google Identity Services (GIS) for OAuth2
   and direct REST API calls for Sheet operations
   ============================================ */

let accessToken = null;
let tokenClient = null;
let sheetId = null;
let sheetName = null; // Auto-detected (e.g. "Sheet1", "Trang tính1")
let tokenExpiresAt = 0;

/**
 * Extract Sheet ID from a Google Sheets URL
 * Supports various URL formats
 */
export function extractSheetId(url) {
    if (!url) return null;
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
}

/**
 * Get the current Sheet ID
 */
export function getSheetId() {
    return sheetId;
}

/**
 * Set the Sheet ID (extracted from URL)
 */
export function setSheetId(id) {
    sheetId = id;
}

/**
 * Initialize the Google OAuth2 token client
 * @param {string} clientId - OAuth2 Client ID from Google Cloud Console
 * @param {function} callback - Called with (token, error)
 */
export function initTokenClient(clientId, callback) {
    if (!window.google?.accounts?.oauth2) {
        console.error('Google Identity Services library not loaded yet');
        callback(null, 'Google Identity Services chưa được tải. Hãy đợi một chút và thử lại.');
        return false;
    }

    try {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: 'https://www.googleapis.com/auth/spreadsheets',
            callback: (response) => {
                if (response.error) {
                    console.error('OAuth error:', response);
                    callback(null, response.error_description || response.error);
                    return;
                }
                accessToken = response.access_token;
                // Token expires in ~1 hour, store expiry time
                tokenExpiresAt = Date.now() + (response.expires_in || 3600) * 1000;

                // Save token info to localStorage
                localStorage.setItem('gsheets_token', accessToken);
                localStorage.setItem('gsheets_token_expires', tokenExpiresAt.toString());

                callback(accessToken, null);
            },
        });
        return true;
    } catch (err) {
        console.error('Failed to init token client:', err);
        callback(null, err.message);
        return false;
    }
}

/**
 * Trigger Google Sign-in popup
 */
export function requestSignIn() {
    if (!tokenClient) {
        throw new Error('Token client not initialized. Call initTokenClient first.');
    }
    tokenClient.requestAccessToken();
}

/**
 * Check if we have a valid access token
 */
export function isAuthenticated() {
    if (!accessToken) return false;
    if (Date.now() >= tokenExpiresAt) {
        accessToken = null;
        return false;
    }
    return true;
}

/**
 * Manually set an access token (e.g., restored from localStorage)
 */
export function setAccessToken(token, expiresAt) {
    accessToken = token;
    if (expiresAt) tokenExpiresAt = expiresAt;
}

/**
 * Get the current access token
 */
export function getAccessToken() {
    return accessToken;
}

/**
 * Clear authentication state
 */
export function clearAuth() {
    accessToken = null;
    tokenExpiresAt = 0;
    localStorage.removeItem('gsheets_token');
    localStorage.removeItem('gsheets_token_expires');
}

/**
 * Re-authenticate if token expired
 */
export async function ensureAuthenticated() {
    if (isAuthenticated()) return true;

    // Try to re-request token silently
    return new Promise((resolve) => {
        if (!tokenClient) {
            resolve(false);
            return;
        }
        try {
            // This will show a consent popup if needed
            tokenClient.requestAccessToken({ prompt: '' });
            // We can't directly know when this completes,
            // the callback in initTokenClient will fire
            // For now, we rely on the caller to handle this flow
            resolve(false);
        } catch {
            resolve(false);
        }
    });
}

/**
 * Make an authenticated API request
 */
async function apiRequest(url, options = {}) {
    if (!accessToken) {
        throw new Error('NOT_AUTHENTICATED');
    }

    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
        // Token expired
        accessToken = null;
        throw new Error('TOKEN_EXPIRED');
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.error?.message || `HTTP ${response.status}`;
        throw new Error(message);
    }

    return response.json();
}

/**
 * Test connection and auto-detect sheet tab name
 */
export async function testConnection() {
    try {
        const data = await apiRequest(
            `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?fields=properties.title,sheets.properties.title`
        );
        // Auto-detect the first sheet's name
        if (data.sheets && data.sheets.length > 0) {
            sheetName = data.sheets[0].properties.title;
            console.log('Detected sheet name:', sheetName);
        }
        return { success: true, title: data.properties?.title };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

/**
 * Get the detected sheet tab name (fallback to "Sheet1")
 */
export function getSheetName() {
    return sheetName || 'Sheet1';
}

/**
 * Set sheet name manually
 */
export function setSheetName(name) {
    sheetName = name;
}

/**
 * Fetch all rows from Sheet1
 * @returns {Array<Array<string>>} 2D array of cell values
 */
export async function fetchAllRows() {
    const name = encodeURIComponent(sheetName || 'Sheet1');
    const data = await apiRequest(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${name}`
    );
    return data.values || [];
}

/**
 * Append a new row to Sheet1
 * @param {Array<string>} rowData - Array of cell values
 */
export async function appendRow(rowData) {
    const name = encodeURIComponent(sheetName || 'Sheet1');
    return apiRequest(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${name}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
        {
            method: 'POST',
            body: JSON.stringify({
                values: [rowData],
            }),
        }
    );
}

/**
 * Update a specific cell range
 * @param {string} range - Cell range (e.g., "Sheet1!A1")
 * @param {string} value - New value
 */
export async function updateCell(range, value) {
    // range should be like "C1" — we prepend the sheet name
    const name = encodeURIComponent(sheetName || 'Sheet1');
    const fullRange = range.includes('!') ? range : `${name}!${range}`;
    return apiRequest(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${fullRange}?valueInputOption=RAW`,
        {
            method: 'PUT',
            body: JSON.stringify({
                values: [[value]],
            }),
        }
    );
}

/**
 * Delete a specific row by index (0-based)
 * @param {number} rowIndex - 0-based row index to delete
 */
export async function deleteRow(rowIndex) {
    return apiRequest(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}:batchUpdate`,
        {
            method: 'POST',
            body: JSON.stringify({
                requests: [
                    {
                        deleteDimension: {
                            range: {
                                sheetId: 0, // First sheet
                                dimension: 'ROWS',
                                startIndex: rowIndex,
                                endIndex: rowIndex + 1,
                            },
                        },
                    },
                ],
            }),
        }
    );
}

/**
 * Get the number of rows in the sheet
 */
export async function getRowCount() {
    const rows = await fetchAllRows();
    return rows.length;
}
