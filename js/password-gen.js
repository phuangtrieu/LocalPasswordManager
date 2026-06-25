/* ============================================
   Password Generator Module
   ============================================ */

const CHARSETS = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    digits: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

/**
 * Generate a random password
 * @param {number} length - Password length (default: 16)
 * @param {object} options - Character set options
 * @returns {string} Generated password
 */
export function generatePassword(length = 16, options = {}) {
    const {
        uppercase = true,
        lowercase = true,
        digits = true,
        symbols = true,
    } = options;

    // Build charset and required characters
    let charset = '';
    const required = [];

    if (uppercase) {
        charset += CHARSETS.uppercase;
        required.push(CHARSETS.uppercase);
    }
    if (lowercase) {
        charset += CHARSETS.lowercase;
        required.push(CHARSETS.lowercase);
    }
    if (digits) {
        charset += CHARSETS.digits;
        required.push(CHARSETS.digits);
    }
    if (symbols) {
        charset += CHARSETS.symbols;
        required.push(CHARSETS.symbols);
    }

    // Fallback if nothing selected
    if (!charset) {
        charset = CHARSETS.lowercase + CHARSETS.digits;
        required.push(CHARSETS.lowercase, CHARSETS.digits);
    }

    // Generate random values using secure crypto API
    const randomValues = new Uint32Array(length);
    crypto.getRandomValues(randomValues);

    const chars = [];

    // Ensure at least one character from each required set
    for (let i = 0; i < required.length && i < length; i++) {
        const set = required[i];
        chars.push(set[randomValues[i] % set.length]);
    }

    // Fill remaining characters from full charset
    for (let i = chars.length; i < length; i++) {
        chars.push(charset[randomValues[i] % charset.length]);
    }

    // Shuffle using Fisher-Yates with secure random
    const shuffleValues = new Uint32Array(chars.length);
    crypto.getRandomValues(shuffleValues);
    for (let i = chars.length - 1; i > 0; i--) {
        const j = shuffleValues[i] % (i + 1);
        [chars[i], chars[j]] = [chars[j], chars[i]];
    }

    return chars.join('');
}

/**
 * Evaluate password strength
 * @param {string} password - Password to evaluate
 * @returns {object} { score, maxScore, label, color, percent }
 */
export function getPasswordStrength(password) {
    if (!password) {
        return { score: 0, maxScore: 7, label: '', color: '#5a5e7a', percent: 0 };
    }

    let score = 0;

    // Length checks
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    if (password.length >= 24) score++;

    // Character variety
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    // Penalty for repeating characters
    if (/(.)\1{2,}/.test(password)) score = Math.max(0, score - 1);

    const maxScore = 8;
    const percent = Math.min(100, (score / maxScore) * 100);

    const levels = [
        { min: 0, label: 'Rất yếu', color: '#ff4757' },
        { min: 2, label: 'Yếu', color: '#ff6b4a' },
        { min: 4, label: 'Trung bình', color: '#ffa502' },
        { min: 5, label: 'Khá mạnh', color: '#a8cc44' },
        { min: 6, label: 'Mạnh', color: '#2ed573' },
        { min: 7, label: 'Rất mạnh', color: '#00d2ff' },
    ];

    const level = [...levels].reverse().find((l) => score >= l.min);

    return {
        score,
        maxScore,
        label: level.label,
        color: level.color,
        percent,
    };
}
