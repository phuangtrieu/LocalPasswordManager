/* ============================================
   Authentication Module
   Handles Master Password verification and 
   session management
   ============================================ */

import { hashPassword } from './crypto.js';
import * as GSheets from './gsheets.js';

let masterPasswordHash = null;
let currentMasterPassword = null;

/**
 * Setup a new master password (first-time use)
 * Stores the hash in Google Sheet row 1
 * @param {string} password - The master password
 * @returns {boolean} Success
 */
export async function setupMasterPassword(password) {
    const hash = await hashPassword(password);

    // Store config in Sheet row 1: CONFIG | master_hash | {hash}
    await GSheets.appendRow(['CONFIG', 'master_hash', hash, '']);

    masterPasswordHash = hash;
    currentMasterPassword = password;
    sessionStorage.setItem('auth_session', 'active');

    return true;
}

/**
 * Verify master password against stored hash
 * @param {string} password - Password to verify
 * @returns {boolean} Whether password is correct
 * @throws {Error} 'NO_MASTER_PASSWORD' if not set up yet
 */
export async function verifyMasterPassword(password) {
    const hash = await hashPassword(password);

    // Fetch config from Sheet
    const rows = await GSheets.fetchAllRows();
    const configRow = rows.find(
        (row) => row[0] === 'CONFIG' && row[1] === 'master_hash'
    );

    if (!configRow) {
        throw new Error('NO_MASTER_PASSWORD');
    }

    if (configRow[2] !== hash) {
        return false;
    }

    masterPasswordHash = hash;
    currentMasterPassword = password;
    sessionStorage.setItem('auth_session', 'active');

    return true;
}

/**
 * Get the current master password (for encryption/decryption)
 * Only available during an active session
 */
export function getMasterPassword() {
    return currentMasterPassword;
}

/**
 * Check if the user is currently logged in
 */
export function isLoggedIn() {
    return (
        !!currentMasterPassword &&
        sessionStorage.getItem('auth_session') === 'active'
    );
}

/**
 * Log out — clear session data
 */
export function logout() {
    currentMasterPassword = null;
    masterPasswordHash = null;
    sessionStorage.removeItem('auth_session');
}

/**
 * Check if a master password has been set up in the Sheet
 * @returns {boolean}
 */
export async function hasMasterPassword() {
    try {
        const rows = await GSheets.fetchAllRows();
        return rows.some(
            (row) => row[0] === 'CONFIG' && row[1] === 'master_hash'
        );
    } catch {
        return false;
    }
}

/**
 * Change master password
 * This requires re-encrypting all entries!
 * @param {string} oldPassword - Current master password
 * @param {string} newPassword - New master password
 */
export async function changeMasterPassword(oldPassword, newPassword) {
    // Verify old password first
    const isValid = await verifyMasterPassword(oldPassword);
    if (!isValid) {
        throw new Error('Mật khẩu cũ không đúng');
    }

    // Note: Re-encrypting all entries with new password
    // should be handled by the app.js module since it
    // requires decrypting and re-encrypting all data

    const newHash = await hashPassword(newPassword);

    // Find the config row and update it
    const rows = await GSheets.fetchAllRows();
    const configRowIndex = rows.findIndex(
        (row) => row[0] === 'CONFIG' && row[1] === 'master_hash'
    );

    if (configRowIndex >= 0) {
        // Update the hash in the sheet (1-indexed for A1 notation)
        await GSheets.updateCell(
            `C${configRowIndex + 1}`,
            newHash
        );
    }

    masterPasswordHash = newHash;
    currentMasterPassword = newPassword;

    return true;
}
