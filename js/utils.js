/* ============================================
   Utility Functions
   ============================================ */

/**
 * Generate a unique ID
 */
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

/**
 * Copy text to clipboard and show toast
 */
export async function copyToClipboard(text, label = '') {
    try {
        await navigator.clipboard.writeText(text);
        showToast(`Đã sao chép${label ? ' ' + label : ''}!`, 'success');
        return true;
    } catch (err) {
        // Fallback for older browsers / insecure contexts
        try {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            textarea.style.left = '-9999px';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showToast(`Đã sao chép${label ? ' ' + label : ''}!`, 'success');
            return true;
        } catch (fallbackErr) {
            showToast('Không thể sao chép. Hãy copy thủ công.', 'error');
            return false;
        }
    }
}

/**
 * Show a toast notification
 */
export function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    // Icon mapping
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ',
    };

    toast.textContent = `${icons[type] || ''} ${message}`;
    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // Auto-dismiss
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, 300);
    }, 3000);
}

/**
 * Debounce a function
 */
export function debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

/**
 * Show loading overlay
 */
export function showLoading(message = 'Đang tải...') {
    let overlay = document.getElementById('loading-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="spinner"></div>
            <div class="loading-text">${message}</div>
        `;
        document.body.appendChild(overlay);
    } else {
        overlay.querySelector('.loading-text').textContent = message;
        overlay.classList.remove('hidden');
    }
}

/**
 * Hide loading overlay
 */
export function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

/**
 * Extract domain/initial from a website URL or name
 */
export function getWebsiteInitial(website) {
    try {
        // Try to parse as URL
        let domain = website;
        if (website.includes('://')) {
            domain = new URL(website).hostname;
        } else if (website.includes('.')) {
            domain = website.split('/')[0];
        }
        // Remove www. and get first letter
        domain = domain.replace(/^www\./, '');
        return domain.charAt(0).toUpperCase();
    } catch {
        return website.charAt(0).toUpperCase();
    }
}

/**
 * Format website name for display
 */
export function formatWebsite(website) {
    try {
        if (website.includes('://')) {
            return new URL(website).hostname.replace(/^www\./, '');
        }
        return website;
    } catch {
        return website;
    }
}
