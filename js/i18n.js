const dictionary = {
    vi: {
        // App Name
        app_name: 'Password In Your Hands',
        app_subtitle: 'Quản lý mật khẩu an toàn',
        
        // Setup Screen
        setup_title: 'Thiết lập ban đầu',
        setup_import_title: 'Khôi phục từ file (Tùy chọn)',
        setup_import_label: 'Tải lên file securevault-config.json',
        setup_import_pw_label: 'Nhập Master Password để giải mã',
        setup_import_pw_placeholder: 'Mật khẩu của file sao lưu',
        btn_import: '🔓 Giải mã & Điền cấu hình',
        setup_or_manual: 'Hoặc nhập thủ công:',
        setup_step1: 'Kết nối Google Sheet',
        setup_sheet_url: 'URL Google Sheet',
        setup_sheet_url_hint: 'Dán đường dẫn Google Sheet mà bạn đã tạo',
        setup_client_id: 'OAuth Client ID',
        setup_client_id_hint: 'Tạo tại <a href="https://console.cloud.google.com/apis/credentials" target="_blank" style="color: var(--accent-cyan);">Google Cloud Console</a>',
        setup_step2: 'Đăng nhập Google',
        btn_google: '<svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg> Đăng nhập với Google',
        status_connected: '<span class="status-dot"></span><span>Đã kết nối</span>',
        status_error: '<span class="status-dot"></span><span>Lỗi kết nối</span>',
        setup_step3: 'Tạo Master Password',
        setup_master_pw: 'Master Password',
        setup_master_pw_ph: 'Nhập mật khẩu chính',
        setup_master_pw_confirm: 'Xác nhận Master Password',
        setup_master_pw_confirm_ph: 'Nhập lại mật khẩu chính',
        btn_complete_setup: '🚀 Bắt đầu sử dụng',
        
        // Login Screen
        login_subtitle: 'Nhập mật khẩu để tiếp tục',
        login_pw_label: 'Master Password',
        login_pw_ph: 'Nhập master password',
        btn_login: '🔓 Đăng nhập',
        btn_reset: '⚙️ Thiết lập lại',
        
        // Dashboard Screen
        dash_title: '🔑 Mật khẩu của tôi',
        search_ph: '🔍 Tìm kiếm trang web, tài khoản...',
        empty_title: 'Chưa có mật khẩu nào',
        empty_subtitle: 'Nhấn nút + để thêm mật khẩu đầu tiên',
        
        // Add Screen
        add_title: 'Thêm mật khẩu',
        add_website: 'Trang web / Dịch vụ',
        add_website_ph: 'vd: google.com, facebook.com',
        add_username: 'Tài khoản',
        add_username_ph: 'vd: email@gmail.com',
        add_password: 'Mật khẩu',
        add_password_ph: 'Nhập hoặc tạo ngẫu nhiên',
        btn_gen_pw: '🎲 Tạo ngẫu nhiên',
        btn_copy: '📋 Sao chép',
        gen_len: 'Độ dài: ',
        btn_save: '💾 Lưu mật khẩu',
        
        // Modals
        modal_unlock_title: '🔓 Giải mã mật khẩu',
        modal_unlock_desc: 'Nhập Master Password để xem mật khẩu cho ',
        
        // Titles
        title_export: 'Xuất cấu hình (Backup)',
        title_refresh: 'Đồng bộ lại',
        title_logout: 'Đăng xuất',
        title_add: 'Thêm mật khẩu mới',
        title_back: 'Quay lại',
        title_delete: 'Xóa',
        title_copy: 'Sao chép',
        title_show_enc: 'Hiện mã hóa',
        title_decrypt: 'Giải mã - cần master password',
        title_toggle_pw: 'Hiện/Ẩn mật khẩu',

        // Modals
        modal_unlock_ph: 'Nhập master password',
        btn_cancel: 'Hủy',
        btn_confirm: 'Xác nhận',
        modal_delete_title: '⚠️ Xác nhận xóa',
        modal_delete_desc: 'Bạn có chắc muốn xóa mật khẩu này? Hành động này không thể hoàn tác.',
        btn_delete: 'Xóa',
        
        // Dynamic Toasts & Messages
        toast_import_pw_req: 'Vui lòng nhập Master Password để giải mã',
        toast_decrypting: 'Đang giải mã...',
        toast_import_success: 'Đã giải mã và nhập cấu hình thành công!',
        toast_import_error: 'Mật khẩu sai hoặc file không hợp lệ',
        toast_url_req: 'Vui lòng nhập URL Google Sheet',
        toast_url_invalid: 'URL Google Sheet không hợp lệ',
        toast_client_req: 'Vui lòng nhập OAuth Client ID',
        toast_login_err: 'Lỗi đăng nhập: ',
        toast_conn_err: 'Lỗi kết nối',
        toast_google_success: 'Đăng nhập Google thành công!',
        toast_sheet_has_pw: 'Sheet đã có master password. Chuyển sang đăng nhập.',
        toast_need_google: 'Vui lòng đăng nhập Google trước',
        toast_create_pw_req: 'Vui lòng tạo master password',
        toast_pw_short: 'Master password phải có ít nhất 6 ký tự',
        toast_pw_mismatch: 'Mật khẩu xác nhận không khớp',
        toast_setting_up: 'Đang thiết lập...',
        toast_setup_success: 'Thiết lập thành công!',
        toast_setup_error: 'Lỗi thiết lập: ',
        toast_login_pw_req: 'Vui lòng nhập master password',
        toast_auth_checking: 'Đang xác thực...',
        toast_session_expired: 'Phiên Google đã hết hạn. Đang đăng nhập lại...',
        toast_wrong_pw: 'Mật khẩu không đúng!',
        toast_login_success: 'Đăng nhập thành công!',
        toast_no_pw: 'Chưa thiết lập master password. Vui lòng setup lại.',
        toast_deleted_config: 'Đã xóa thiết lập. Hãy cấu hình lại.',
        toast_no_config: 'Không tìm thấy cấu hình để xuất',
        toast_no_login_export: 'Chưa đăng nhập, không thể mã hóa',
        toast_exporting: 'Đang tạo file cấu hình...',
        toast_export_success: 'Đã tải xuống file cấu hình an toàn',
        toast_export_error: 'Lỗi xuất cấu hình: ',
        toast_syncing: 'Đang đồng bộ...',
        toast_sync_success: 'Đã đồng bộ dữ liệu',
        toast_logout: 'Đã đăng xuất',
        toast_fill_all: 'Vui lòng điền đủ thông tin',
        toast_saving: 'Đang lưu...',
        toast_save_success: 'Đã lưu mật khẩu thành công!',
        toast_save_error: 'Lỗi lưu: ',
        toast_deleting: 'Đang xóa...',
        toast_delete_success: 'Đã xóa mật khẩu thành công!',
        toast_delete_error: 'Lỗi xóa: ',
        toast_decrypted: 'Đã giải mã mật khẩu',
        toast_copy_success: 'Đã sao chép ',
        toast_copy_error: 'Không thể sao chép!',
        
        // Labels in JS
        lbl_username: 'tài khoản',
        lbl_password: 'mật khẩu'
    },
    en: {
        // App Name
        app_name: 'Password In Your Hands',
        app_subtitle: 'Secure Password Manager',
        
        // Setup Screen
        setup_title: 'Initial Setup',
        setup_import_title: 'Restore from file (Optional)',
        setup_import_label: 'Upload securevault-config.json',
        setup_import_pw_label: 'Enter Master Password to decrypt',
        setup_import_pw_placeholder: 'Backup file password',
        btn_import: '🔓 Decrypt & Auto-fill',
        setup_or_manual: 'Or enter manually:',
        setup_step1: 'Connect Google Sheet',
        setup_sheet_url: 'Google Sheet URL',
        setup_sheet_url_hint: 'Paste the Google Sheet URL you created',
        setup_client_id: 'OAuth Client ID',
        setup_client_id_hint: 'Create at <a href="https://console.cloud.google.com/apis/credentials" target="_blank" style="color: var(--accent-cyan);">Google Cloud Console</a>',
        setup_step2: 'Google Sign-in',
        btn_google: '<svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg> Sign in with Google',
        status_connected: '<span class="status-dot"></span><span>Connected</span>',
        status_error: '<span class="status-dot"></span><span>Connection error</span>',
        setup_step3: 'Create Master Password',
        setup_master_pw: 'Master Password',
        setup_master_pw_ph: 'Enter master password',
        setup_master_pw_confirm: 'Confirm Master Password',
        setup_master_pw_confirm_ph: 'Re-enter master password',
        btn_complete_setup: '🚀 Start Using',
        
        // Login Screen
        login_subtitle: 'Enter password to continue',
        login_pw_label: 'Master Password',
        login_pw_ph: 'Enter master password',
        btn_login: '🔓 Login',
        btn_reset: '⚙️ Reset Setup',
        
        // Dashboard Screen
        dash_title: '🔑 My Passwords',
        search_ph: '🔍 Search website, username...',
        empty_title: 'No passwords yet',
        empty_subtitle: 'Tap the + button to add your first password',
        
        // Add Screen
        add_title: 'Add Password',
        add_website: 'Website / Service',
        add_website_ph: 'e.g. google.com, facebook.com',
        add_username: 'Username',
        add_username_ph: 'e.g. email@gmail.com',
        add_password: 'Password',
        add_password_ph: 'Enter or generate randomly',
        btn_gen_pw: '🎲 Generate Random',
        btn_copy: '📋 Copy',
        gen_len: 'Length: ',
        btn_save: '💾 Save Password',
        
        // Titles
        title_export: 'Export Config (Backup)',
        title_refresh: 'Sync / Refresh',
        title_logout: 'Logout',
        title_add: 'Add new password',
        title_back: 'Go Back',
        title_delete: 'Delete',
        title_copy: 'Copy',
        title_show_enc: 'Show Encrypted',
        title_decrypt: 'Decrypt (Requires Master Password)',
        title_toggle_pw: 'Show/Hide Password',
        
        // Modals
        modal_unlock_title: '🔓 Unlock Password',
        modal_unlock_desc: 'Enter Master Password to view password for ',
        modal_unlock_ph: 'Enter master password',
        btn_cancel: 'Cancel',
        btn_confirm: 'Confirm',
        modal_delete_title: '⚠️ Confirm Deletion',
        modal_delete_desc: 'Are you sure you want to delete this password? This action cannot be undone.',
        btn_delete: 'Delete',
        
        // Dynamic Toasts & Messages
        toast_import_pw_req: 'Please enter Master Password to decrypt',
        toast_decrypting: 'Decrypting...',
        toast_import_success: 'Config decrypted and imported successfully!',
        toast_import_error: 'Incorrect password or invalid file',
        toast_url_req: 'Please enter Google Sheet URL',
        toast_url_invalid: 'Invalid Google Sheet URL',
        toast_client_req: 'Please enter OAuth Client ID',
        toast_login_err: 'Login error: ',
        toast_conn_err: 'Connection error',
        toast_google_success: 'Google sign-in successful!',
        toast_sheet_has_pw: 'Sheet already has master password. Switching to login.',
        toast_need_google: 'Please sign in with Google first',
        toast_create_pw_req: 'Please create a master password',
        toast_pw_short: 'Master password must be at least 6 characters',
        toast_pw_mismatch: 'Passwords do not match',
        toast_setting_up: 'Setting up...',
        toast_setup_success: 'Setup successful!',
        toast_setup_error: 'Setup error: ',
        toast_login_pw_req: 'Please enter master password',
        toast_auth_checking: 'Authenticating...',
        toast_session_expired: 'Google session expired. Logging in again...',
        toast_wrong_pw: 'Incorrect password!',
        toast_login_success: 'Login successful!',
        toast_no_pw: 'Master password not set. Please setup again.',
        toast_deleted_config: 'Setup deleted. Please reconfigure.',
        toast_no_config: 'No configuration found to export',
        toast_no_login_export: 'Not logged in, cannot encrypt export',
        toast_exporting: 'Creating config file...',
        toast_export_success: 'Secure config file downloaded',
        toast_export_error: 'Export error: ',
        toast_syncing: 'Syncing...',
        toast_sync_success: 'Data synced successfully',
        toast_logout: 'Logged out',
        toast_fill_all: 'Please fill in all fields',
        toast_saving: 'Saving...',
        toast_save_success: 'Password saved successfully!',
        toast_save_error: 'Save error: ',
        toast_deleting: 'Deleting...',
        toast_delete_success: 'Password deleted successfully!',
        toast_delete_error: 'Delete error: ',
        toast_decrypted: 'Password decrypted',
        toast_copy_success: 'Copied ',
        toast_copy_error: 'Failed to copy!',
        
        // Labels in JS
        lbl_username: 'username',
        lbl_password: 'password'
    }
};

let currentLang = localStorage.getItem('securevault_lang') || 'vi';

export function getLang() {
    return currentLang;
}

export function setLang(lang) {
    if (dictionary[lang] && currentLang !== lang) {
        currentLang = lang;
        localStorage.setItem('securevault_lang', lang);
        updateDOM();
        updateLanguageToggleUI();
        
        // Also update placeholders via manual query if they have data-i18n
        document.querySelectorAll('input[data-i18n-ph]').forEach(el => {
            const key = el.getAttribute('data-i18n-ph');
            if (dictionary[currentLang][key]) {
                el.placeholder = dictionary[currentLang][key];
            }
        });
        
        // Update titles
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            if (dictionary[currentLang][key]) {
                el.title = dictionary[currentLang][key];
            }
        });
    }
}

export function t(key) {
    return dictionary[currentLang]?.[key] || key;
}

export function updateDOM() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (key && dictionary[currentLang][key]) {
            el.innerHTML = dictionary[currentLang][key];
        }
    });

    const placeholders = document.querySelectorAll('[data-i18n-ph]');
    placeholders.forEach(el => {
        const key = el.getAttribute('data-i18n-ph');
        if (key && dictionary[currentLang][key]) {
            el.placeholder = dictionary[currentLang][key];
        }
    });

    const titles = document.querySelectorAll('[data-i18n-title]');
    titles.forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        if (key && dictionary[currentLang][key]) {
            el.title = dictionary[currentLang][key];
        }
    });
}

function updateLanguageToggleUI() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn.dataset.lang === currentLang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

export function initI18n() {
    updateDOM();
    updateLanguageToggleUI();
    
    // Bind all lang toggle buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const lang = e.currentTarget.dataset.lang;
            setLang(lang);
        });
    });
}
