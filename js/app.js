/* ============================================
   SecureVault — Main Application Logic
   Handles routing, UI rendering, and orchestration
   ============================================ */

import * as Auth from './auth.js';
import * as Crypto from './crypto.js';
import * as GSheets from './gsheets.js';
import { generatePassword, getPasswordStrength } from './password-gen.js';
import { t, initI18n } from './i18n.js';
import {
    copyToClipboard,
    showToast,
    generateId,
    showLoading,
    hideLoading,
    getWebsiteInitial,
    formatWebsite,
    debounce,
} from './utils.js';

// ============================================
// State
// ============================================
let entries = [];
let filteredEntries = [];
let currentScreen = null;
let isGoogleReady = false;

// ============================================
// Config helpers (localStorage)
// ============================================
function getConfig() {
    try {
        return JSON.parse(localStorage.getItem('securevault_config') || 'null');
    } catch {
        return null;
    }
}

function saveConfig(config) {
    localStorage.setItem('securevault_config', JSON.stringify(config));
}

function clearConfig() {
    localStorage.removeItem('securevault_config');
}

// ============================================
// Screen Navigation
// ============================================
function showScreen(screenName) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach((s) => s.classList.add('hidden'));

    const target = document.getElementById(`${screenName}-screen`);
    if (target) {
        target.classList.remove('hidden');
        currentScreen = screenName;
    }
}

// ============================================
// Setup Screen Logic
// ============================================
function initSetupScreen() {
    const btnGoogleSignin = document.getElementById('btn-google-signin');
    const btnCompleteSetup = document.getElementById('btn-complete-setup');
    const sheetUrlInput = document.getElementById('sheet-url');
    const clientIdInput = document.getElementById('client-id');
    const googleStatus = document.getElementById('google-status');
    const setupPasswordInput = document.getElementById('setup-master-pw');
    const setupPasswordConfirm = document.getElementById('setup-master-pw-confirm');

    // Load saved values if any
    const config = getConfig();
    if (config) {
        if (config.sheetUrl) sheetUrlInput.value = config.sheetUrl;
        if (config.clientId) clientIdInput.value = config.clientId;
    }

    // Import config from file
    const importFile = document.getElementById('import-file');
    const importPasswordContainer = document.getElementById('import-password-container');
    const importPassword = document.getElementById('import-password');
    const btnImportConfig = document.getElementById('btn-import-config');
    let encryptedConfigData = null;

    if (importFile) {
        importFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) {
                importPasswordContainer.classList.add('hidden');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                encryptedConfigData = e.target.result;
                importPasswordContainer.classList.remove('hidden');
                importPassword.focus();
            };
            reader.readAsText(file);
        });
    }

    if (btnImportConfig) {
        btnImportConfig.addEventListener('click', async () => {
            const pw = importPassword.value;
            if (!pw) {
                showToast(t('toast_import_pw_req'), 'warning');
                importPassword.focus();
                return;
            }

            try {
                showLoading(t('toast_decrypting'));
                const decrypted = await Crypto.decrypt(encryptedConfigData, pw);
                const parsedConfig = JSON.parse(decrypted);

                if (parsedConfig.sheetUrl) sheetUrlInput.value = parsedConfig.sheetUrl;
                if (parsedConfig.clientId) clientIdInput.value = parsedConfig.clientId;

                hideLoading();
                showToast(t('toast_import_success'), 'success');
                
                importPassword.value = '';
                importPasswordContainer.classList.add('hidden');
                importFile.value = ''; 
                
                btnGoogleSignin.scrollIntoView({ behavior: 'smooth' });
            } catch (err) {
                hideLoading();
                showToast(t('toast_import_error'), 'error');
                importPassword.value = '';
                importPassword.focus();
            }
        });
    }

    // Google Sign-in button
    btnGoogleSignin.addEventListener('click', () => {
        const clientId = clientIdInput.value.trim();
        const sheetUrl = sheetUrlInput.value.trim();

        if (!sheetUrl) {
            showToast(t('toast_url_req'), 'warning');
            sheetUrlInput.focus();
            return;
        }

        const extractedId = GSheets.extractSheetId(sheetUrl);
        if (!extractedId) {
            showToast(t('toast_url_invalid'), 'error');
            sheetUrlInput.focus();
            return;
        }

        if (!clientId) {
            showToast(t('toast_client_req'), 'warning');
            clientIdInput.focus();
            return;
        }

        GSheets.setSheetId(extractedId);

        const initialized = GSheets.initTokenClient(clientId, async (token, error) => {
            if (error) {
                showToast(`${t('toast_login_err')}${error}`, 'error');
                googleStatus.className = 'status-badge status-error';
                googleStatus.innerHTML = '<span class="status-dot"></span><span>Lỗi kết nối</span>';
                return;
            }

            // Test connection
            const test = await GSheets.testConnection();
            if (test.success) {
                googleStatus.className = 'status-badge status-success';
                googleStatus.innerHTML = `<span class="status-dot"></span><span>Đã kết nối: ${test.title || 'Sheet'}</span>`;
                showToast(t('toast_google_success'), 'success');

                // Check if master password already exists
                const hasPw = await Auth.hasMasterPassword();
                if (hasPw) {
                    // Sheet already has master password — go to login
                    saveConfig({ sheetUrl, clientId, sheetId: extractedId });
                    showToast(t('toast_sheet_has_pw'), 'info');
                    setTimeout(() => showScreen('login'), 1000);
                }
            } else {
                googleStatus.className = 'status-badge status-error';
                googleStatus.innerHTML = '<span class="status-dot"></span><span>Không thể truy cập Sheet</span>';
                showToast(`${t('toast_conn_err')}: ${test.error}`, 'error');
            }
        });

        if (initialized) {
            GSheets.requestSignIn();
        }
    });

    // Setup master password strength meter
    setupPasswordInput.addEventListener('input', () => {
        updateStrengthMeter('setup-strength', setupPasswordInput.value);
    });

    // Complete setup
    btnCompleteSetup.addEventListener('click', async () => {
        const sheetUrl = sheetUrlInput.value.trim();
        const clientId = clientIdInput.value.trim();
        const password = setupPasswordInput.value;
        const confirm = setupPasswordConfirm.value;

        if (!GSheets.isAuthenticated()) {
            showToast(t('toast_need_google'), 'warning');
            return;
        }

        if (!password) {
            showToast(t('toast_create_pw_req'), 'warning');
            setupPasswordInput.focus();
            return;
        }

        if (password.length < 6) {
            showToast(t('toast_pw_short'), 'warning');
            setupPasswordInput.focus();
            return;
        }

        if (password !== confirm) {
            showToast(t('toast_pw_mismatch'), 'error');
            setupPasswordConfirm.focus();
            return;
        }

        try {
            showLoading(t('toast_setting_up'));

            await Auth.setupMasterPassword(password);

            const extractedId = GSheets.extractSheetId(sheetUrl);
            saveConfig({ sheetUrl, clientId, sheetId: extractedId });

            hideLoading();
            showToast(t('toast_setup_success'), 'success');

            // Load entries and go to dashboard
            await loadEntries();
            showScreen('dashboard');
        } catch (err) {
            hideLoading();
            showToast(`${t('toast_setup_error')}${err.message}`, 'error');
        }
    });
}

// ============================================
// Login Screen Logic
// ============================================
function initLoginScreen() {
    const loginPasswordInput = document.getElementById('login-password');
    const btnLogin = document.getElementById('btn-login');
    const btnResetSetup = document.getElementById('btn-reset-setup');

    // Login handler
    async function doLogin() {
        const password = loginPasswordInput.value;

        if (!password) {
            showToast(t('toast_login_pw_req'), 'warning');
            loginPasswordInput.focus();
            return;
        }

        try {
            showLoading(t('toast_auth_checking'));

            // Ensure Google auth is still valid
            if (!GSheets.isAuthenticated()) {
                const config = getConfig();
                if (config?.clientId) {
                    // Need to re-authenticate with Google
                    hideLoading();
                    showToast(t('toast_session_expired'), 'warning');

                    GSheets.initTokenClient(config.clientId, async (token, error) => {
                        if (error) {
                            showToast(`${t('toast_conn_err')}: ${error}`, 'error');
                            return;
                        }
                        // Retry login
                        doLogin();
                    });
                    GSheets.requestSignIn();
                    return;
                }
            }

            const isValid = await Auth.verifyMasterPassword(password);

            if (!isValid) {
                hideLoading();
                showToast(t('toast_wrong_pw'), 'error');
                loginPasswordInput.value = '';
                loginPasswordInput.focus();
                return;
            }

            await loadEntries();
            hideLoading();
            showToast(t('toast_login_success'), 'success');
            loginPasswordInput.value = '';
            showScreen('dashboard');
        } catch (err) {
            hideLoading();
            if (err.message === 'NO_MASTER_PASSWORD') {
                showToast(t('toast_no_pw'), 'error');
                showScreen('setup');
            } else {
                showToast(`${t('toast_conn_err')}: ${err.message}`, 'error');
            }
        }
    }

    btnLogin.addEventListener('click', doLogin);
    loginPasswordInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') doLogin();
    });

    // Reset setup
    btnResetSetup.addEventListener('click', () => {
        clearConfig();
        GSheets.clearAuth();
        Auth.logout();
        showToast(t('toast_deleted_config'), 'info');
        showScreen('setup');
    });
}

// ============================================
// Dashboard Screen Logic
// ============================================
function initDashboardScreen() {
    const btnRefresh = document.getElementById('btn-refresh');
    const btnLogout = document.getElementById('btn-logout');
    const btnExportConfig = document.getElementById('btn-export-config');
    const searchInput = document.getElementById('search-input');
    const fabAdd = document.getElementById('fab-add');

    if (btnExportConfig) {
        btnExportConfig.addEventListener('click', async () => {
            const config = getConfig();
            if (!config || !config.sheetUrl || !config.clientId) {
                showToast(t('toast_no_config'), 'error');
                return;
            }

            const masterPw = Auth.getMasterPassword();
            if (!masterPw) {
                showToast(t('toast_no_login_export'), 'error');
                return;
            }

            try {
                showLoading('Đang tạo file cấu hình...');
                
                const jsonStr = JSON.stringify({
                    sheetUrl: config.sheetUrl,
                    clientId: config.clientId
                });

                const encrypted = await Crypto.encrypt(jsonStr, masterPw);
                
                const blob = new Blob([encrypted], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = url;
                a.download = 'securevault-config.json';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                hideLoading();
                showToast(t('toast_export_success'), 'success');
            } catch (err) {
                hideLoading();
                showToast(`${t('toast_export_error')}${err.message}`, 'error');
            }
        });
    }

    btnRefresh.addEventListener('click', async () => {
        try {
            showLoading(t('toast_syncing'));
            await loadEntries();
            renderEntries();
            hideLoading();
            showToast(t('toast_sync_success'), 'success');
        } catch (err) {
            hideLoading();
            showToast(`${t('toast_conn_err')}: ${err.message}`, 'error');
        }
    });

    btnLogout.addEventListener('click', () => {
        Auth.logout();
        entries = [];
        filteredEntries = [];
        showToast(t('toast_logout'), 'info');
        showScreen('login');
    });

    // Search
    searchInput.addEventListener(
        'input',
        debounce((e) => {
            const query = e.target.value.toLowerCase().trim();
            if (!query) {
                filteredEntries = [...entries];
            } else {
                filteredEntries = entries.filter(
                    (entry) =>
                        entry.website.toLowerCase().includes(query) ||
                        entry.username.toLowerCase().includes(query)
                );
            }
            renderEntries();
        }, 200)
    );

    // FAB — go to add screen
    fabAdd.addEventListener('click', () => {
        showScreen('add');
    });
}

// ============================================
// Add Screen Logic
// ============================================
function initAddScreen() {
    const btnBack = document.getElementById('btn-back');
    const websiteInput = document.getElementById('add-website');
    const usernameInput = document.getElementById('add-username');
    const passwordInput = document.getElementById('add-password');
    const btnGenerate = document.getElementById('btn-generate');
    const btnCopyNewPw = document.getElementById('btn-copy-new-pw');
    const btnSave = document.getElementById('btn-save');
    const genOptions = document.getElementById('gen-options');
    const genLength = document.getElementById('gen-length');
    const genLengthValue = document.getElementById('gen-length-value');

    // Back button
    btnBack.addEventListener('click', () => {
        clearAddForm();
        showScreen('dashboard');
    });

    // Generate password button
    btnGenerate.addEventListener('click', () => {
        genOptions.classList.toggle('visible');

        const length = parseInt(genLength.value);
        const options = getGenOptions();
        const pw = generatePassword(length, options);
        passwordInput.value = pw;
        passwordInput.type = 'text'; // Show generated password
        updateStrengthMeter('add-strength', pw);
    });

    // Copy new password
    btnCopyNewPw.addEventListener('click', () => {
        if (passwordInput.value) {
            copyToClipboard(passwordInput.value, 'mật khẩu');
        }
    });

    // Password length slider
    genLength.addEventListener('input', () => {
        genLengthValue.textContent = genLength.value;
        const options = getGenOptions();
        const pw = generatePassword(parseInt(genLength.value), options);
        passwordInput.value = pw;
        updateStrengthMeter('add-strength', pw);
    });

    // Checkbox changes → regenerate
    ['gen-upper', 'gen-lower', 'gen-digits', 'gen-symbols'].forEach((id) => {
        document.getElementById(id).addEventListener('change', () => {
            if (genOptions.classList.contains('visible')) {
                const length = parseInt(genLength.value);
                const options = getGenOptions();
                const pw = generatePassword(length, options);
                passwordInput.value = pw;
                updateStrengthMeter('add-strength', pw);
            }
        });
    });

    // Password input → strength meter
    passwordInput.addEventListener('input', () => {
        updateStrengthMeter('add-strength', passwordInput.value);
    });

    // Save button
    btnSave.addEventListener('click', async () => {
        const website = websiteInput.value.trim();
        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!website) {
            showToast(t('toast_fill_all'), 'warning');
            websiteInput.focus();
            return;
        }
        if (!username) {
            showToast(t('toast_fill_all'), 'warning');
            usernameInput.focus();
            return;
        }
        if (!password) {
            showToast(t('toast_fill_all'), 'warning');
            passwordInput.focus();
            return;
        }

        try {
            showLoading('Đang mã hóa và lưu...');

            const masterPw = Auth.getMasterPassword();
            const encWebsite = await Crypto.encrypt(website, masterPw);
            const encUsername = await Crypto.encrypt(username, masterPw);
            const encPassword = await Crypto.encrypt(password, masterPw);
            const entryId = generateId();

            await GSheets.appendRow([entryId, encWebsite, encUsername, encPassword]);

            // Add to local state
            entries.push({
                id: entryId,
                website,
                username,
                password,
                encryptedPassword: encPassword,
                rowIndex: -1, // Will be corrected on next full fetch
            });
            filteredEntries = [...entries];

            hideLoading();
            showToast(t('toast_save_success'), 'success');
            clearAddForm();
            renderEntries();
            showScreen('dashboard');
        } catch (err) {
            hideLoading();
            showToast(`${t('toast_save_error')}${err.message}`, 'error');
        }
    });
}

function getGenOptions() {
    return {
        uppercase: document.getElementById('gen-upper').checked,
        lowercase: document.getElementById('gen-lower').checked,
        digits: document.getElementById('gen-digits').checked,
        symbols: document.getElementById('gen-symbols').checked,
    };
}

function clearAddForm() {
    document.getElementById('add-website').value = '';
    document.getElementById('add-username').value = '';
    document.getElementById('add-password').value = '';
    document.getElementById('add-password').type = 'password';
    document.getElementById('gen-options').classList.remove('visible');
    const meter = document.getElementById('add-strength');
    meter.classList.remove('visible');
}

// ============================================
// Load & Render Entries
// ============================================
async function loadEntries() {
    const masterPw = Auth.getMasterPassword();
    if (!masterPw) return;

    const rows = await GSheets.fetchAllRows();
    entries = [];

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        // Skip config rows
        if (row[0] === 'CONFIG') continue;
        // Skip incomplete rows
        if (!row[1] || !row[2] || !row[3]) continue;

        try {
            const website = await Crypto.decrypt(row[1], masterPw);
            const username = await Crypto.decrypt(row[2], masterPw);
            const password = await Crypto.decrypt(row[3], masterPw);

            entries.push({
                id: row[0],
                website,
                username,
                password,
                encryptedPassword: row[3],
                rowIndex: i, // 0-based index in sheet
            });
        } catch (err) {
            console.warn(`Failed to decrypt entry at row ${i + 1}:`, err);
        }
    }

    filteredEntries = [...entries];
    renderEntries();
}

function renderEntries() {
    const list = document.getElementById('entries-list');
    const emptyState = document.getElementById('empty-state');

    if (filteredEntries.length === 0) {
        list.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');

    list.innerHTML = filteredEntries
        .map(
            (entry, index) => `
        <div class="entry-card" data-id="${entry.id}" style="animation-delay: ${index * 0.05}s">
            <div class="entry-header">
                <div class="entry-website">
                    <div class="entry-favicon">${getWebsiteInitial(entry.website)}</div>
                    <span class="entry-website-name">${escapeHtml(formatWebsite(entry.website))}</span>
                </div>
                <div class="entry-actions">
                    <button class="btn-icon btn-danger-icon" onclick="window.app.confirmDelete('${entry.id}')" title="${t('title_delete')}">
                        🗑️
                    </button>
                </div>
            </div>
            <div class="entry-fields">
                <div class="entry-field">
                    <div class="entry-field-info">
                        <span class="entry-field-label">Tài khoản</span>
                        <span class="entry-field-value">${escapeHtml(entry.username)}</span>
                    </div>
                    <div class="entry-field-actions">
                        <button class="btn-icon" onclick="window.app.copyField('${escapeAttr(entry.username)}', 'tài khoản')" title="${t('title_copy')}">
                            📋
                        </button>
                    </div>
                </div>
                <div class="entry-field">
                    <div class="entry-field-info">
                        <span class="entry-field-label">Mật khẩu</span>
                        <span class="entry-field-value password-hidden" id="pw-${entry.id}">••••••••</span>
                    </div>
                    <div class="entry-field-actions">
                        <button class="btn-icon" onclick="window.app.toggleEncrypted('${entry.id}')" title="${t('title_show_enc')}">
                            👁️
                        </button>
                        <button class="btn-icon" onclick="window.app.unlockPassword('${entry.id}')" title="${t('title_decrypt')}">
                            🔓
                        </button>
                        <button class="btn-icon" onclick="window.app.copyField('${escapeAttr(entry.password)}', 'mật khẩu')" title="${t('title_copy')}">
                            📋
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `
        )
        .join('');
}

// ============================================
// Entry Actions
// ============================================

/**
 * Toggle encrypted password visibility (shows ciphertext)
 */
function toggleEncryptedVisibility(entryId) {
    const el = document.getElementById(`pw-${entryId}`);
    if (!el) return;

    const entry = entries.find((e) => e.id === entryId);
    if (!entry) return;

    // If currently showing decrypted, go back to hidden
    if (el.dataset.state === 'decrypted') {
        el.textContent = '••••••••';
        el.classList.add('password-hidden');
        el.classList.remove('password-encrypted');
        el.dataset.state = 'hidden';
        return;
    }

    if (el.classList.contains('password-hidden')) {
        // Show encrypted text (ciphertext)
        const encrypted = entry.encryptedPassword || '???';
        // Show truncated version for readability
        const display = encrypted.length > 40
            ? encrypted.substring(0, 20) + '...' + encrypted.substring(encrypted.length - 10)
            : encrypted;
        el.textContent = display;
        el.title = encrypted; // Full text on hover
        el.classList.remove('password-hidden');
        el.classList.add('password-encrypted');
        el.dataset.state = 'encrypted';
    } else {
        // Go back to hidden
        el.textContent = '••••••••';
        el.classList.add('password-hidden');
        el.classList.remove('password-encrypted');
        el.dataset.state = 'hidden';
    }
}

/**
 * Unlock password — requires master password to show plaintext
 */
function showUnlockModal(entryId) {
    const entry = entries.find((e) => e.id === entryId);
    if (!entry) return;

    const modal = document.getElementById('unlock-modal');
    const modalWebsite = document.getElementById('unlock-modal-website');
    const passwordInput = document.getElementById('unlock-master-pw');
    const btnConfirm = document.getElementById('btn-confirm-unlock');
    const btnCancel = document.getElementById('btn-cancel-unlock');

    modalWebsite.textContent = formatWebsite(entry.website);
    passwordInput.value = '';
    modal.classList.remove('hidden');
    setTimeout(() => passwordInput.focus(), 100);

    // Remove old listeners by cloning
    const newConfirm = btnConfirm.cloneNode(true);
    btnConfirm.parentNode.replaceChild(newConfirm, btnConfirm);
    const newCancel = btnCancel.cloneNode(true);
    btnCancel.parentNode.replaceChild(newCancel, btnCancel);

    async function doUnlock() {
        const inputPw = passwordInput.value;
        if (!inputPw) {
            showToast(t('toast_login_pw_req'), 'warning');
            passwordInput.focus();
            return;
        }

        try {
            // Verify master password by trying to decrypt
            const decrypted = await Crypto.decrypt(entry.encryptedPassword, inputPw);
            
            // Success — show decrypted password
            const el = document.getElementById(`pw-${entryId}`);
            if (el) {
                el.textContent = decrypted;
                el.classList.remove('password-hidden', 'password-encrypted');
                el.classList.add('password-decrypted');
                el.dataset.state = 'decrypted';
            }
            modal.classList.add('hidden');
            showToast(t('toast_decrypted'), 'success');

            // Auto-hide after 30 seconds for security
            setTimeout(() => {
                if (el && el.dataset.state === 'decrypted') {
                    el.textContent = '••••••••';
                    el.classList.add('password-hidden');
                    el.classList.remove('password-decrypted');
                    el.dataset.state = 'hidden';
                }
            }, 30000);
        } catch (err) {
            showToast(t('toast_wrong_pw'), 'error');
            passwordInput.value = '';
            passwordInput.focus();
        }
    }

    newConfirm.addEventListener('click', doUnlock);
    passwordInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') doUnlock();
    });
    newCancel.addEventListener('click', () => {
        modal.classList.add('hidden');
    });
}

function showDeleteConfirm(entryId) {
    const entry = entries.find((e) => e.id === entryId);
    if (!entry) return;

    const modal = document.getElementById('delete-modal');
    const modalWebsite = document.getElementById('delete-modal-website');
    const btnConfirm = document.getElementById('btn-confirm-delete');
    const btnCancel = document.getElementById('btn-cancel-delete');

    modalWebsite.textContent = formatWebsite(entry.website);
    modal.classList.remove('hidden');

    // Remove old listeners by cloning
    const newConfirm = btnConfirm.cloneNode(true);
    btnConfirm.parentNode.replaceChild(newConfirm, btnConfirm);

    const newCancel = btnCancel.cloneNode(true);
    btnCancel.parentNode.replaceChild(newCancel, btnCancel);

    newCancel.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    newConfirm.addEventListener('click', async () => {
        modal.classList.add('hidden');
        await deleteEntry(entryId);
    });
}

async function deleteEntry(entryId) {
    const entry = entries.find((e) => e.id === entryId);
    if (!entry) return;

    try {
        showLoading(t('toast_deleting'));

        // We need to find the current row index by re-fetching
        const rows = await GSheets.fetchAllRows();
        let rowIndex = -1;
        for (let i = 0; i < rows.length; i++) {
            if (rows[i][0] === entryId) {
                rowIndex = i;
                break;
            }
        }

        if (rowIndex === -1) {
            hideLoading();
            showToast(t('toast_delete_error'), 'error');
            return;
        }

        await GSheets.deleteRow(rowIndex);

        // Remove from local state
        entries = entries.filter((e) => e.id !== entryId);
        filteredEntries = filteredEntries.filter((e) => e.id !== entryId);
        renderEntries();

        hideLoading();
        showToast(t('toast_delete_success'), 'success');
    } catch (err) {
        hideLoading();
        showToast(`${t('toast_delete_error')}${err.message}`, 'error');
    }
}

// ============================================
// Strength Meter
// ============================================
function updateStrengthMeter(meterId, password) {
    const container = document.getElementById(meterId);
    if (!container) return;

    const strength = getPasswordStrength(password);
    const bar = container.querySelector('.strength-bar');
    const label = container.querySelector('.strength-label');

    if (password) {
        container.classList.add('visible');
        bar.style.width = `${strength.percent}%`;
        bar.style.background = strength.color;
        label.textContent = strength.label;
        label.style.color = strength.color;
    } else {
        container.classList.remove('visible');
    }
}

// ============================================
// Password Toggle (eye button)
// ============================================
function initPasswordToggles() {
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-toggle-pw');
        if (!btn) return;

        const input = btn.parentElement.querySelector('input');
        if (!input) return;

        if (input.type === 'password') {
            input.type = 'text';
            btn.textContent = '🔒';
        } else {
            input.type = 'password';
            btn.textContent = '👁️';
        }
    });
}

// ============================================
// Helpers
// ============================================
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function escapeAttr(str) {
    return str
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// ============================================
// Global API (for onclick handlers in HTML)
// ============================================
window.app = {
    toggleEncrypted: toggleEncryptedVisibility,
    unlockPassword: showUnlockModal,
    confirmDelete: showDeleteConfirm,
    copyField: (value, label) => copyToClipboard(value, label),
};

// ============================================
// Initialization
// ============================================
async function init() {
    initI18n();
    initPasswordToggles();
    initSetupScreen();
    initLoginScreen();
    initDashboardScreen();
    initAddScreen();

    // Check if app is already configured
    const config = getConfig();

    if (!config || !config.sheetId || !config.clientId) {
        // First time — show setup
        showScreen('setup');
        return;
    }

    // Restore Sheet ID
    GSheets.setSheetId(config.sheetId);

    // Try to restore Google auth token
    const savedToken = localStorage.getItem('gsheets_token');
    const savedExpires = parseInt(localStorage.getItem('gsheets_token_expires') || '0');

    if (savedToken && Date.now() < savedExpires) {
        GSheets.setAccessToken(savedToken, savedExpires);
        // Go to login
        showScreen('login');
    } else {
        // Token expired, need to re-auth
        // Initialize token client and auto-prompt
        showScreen('login');

        // When user tries to login, they'll be prompted to re-auth with Google
        GSheets.initTokenClient(config.clientId, (token, error) => {
            if (error) {
                showToast(t('toast_login_err'), 'error');
                return;
            }
            showToast(t('toast_google_success'), 'success');
        });
    }
}

// Wait for DOM
document.addEventListener('DOMContentLoaded', init);

// Register Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {
        // SW registration failed, likely running from file:// protocol
        // This is fine, PWA features just won't work
    });
}
