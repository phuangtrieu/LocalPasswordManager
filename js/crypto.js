/* ============================================
   Encryption Module (Placeholder — AES-256-GCM)
   
   Interface:
     encrypt(plaintext, password) → base64 string
     decrypt(ciphertext, password) → plaintext string
     hashPassword(password) → hex string
   
   NOTE: This module uses AES-256-GCM as default.
   The user will provide their custom encryption 
   method later, which will replace this implementation.
   ============================================ */

/**
 * Derive an AES-256 key from a password using PBKDF2
 */
async function deriveKey(password, salt) {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveKey']
    );
    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

/**
 * Encrypt plaintext with a password
 * @param {string} plaintext - Text to encrypt
 * @param {string} password - Master password used as encryption key
 * @returns {string} Base64 encoded ciphertext (salt + iv + encrypted data)
 */
export async function encrypt(plaintext, password) {
    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, salt);

    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encoder.encode(plaintext)
    );

    // Combine: salt (16) + iv (12) + ciphertext
    const combined = new Uint8Array(
        salt.length + iv.length + new Uint8Array(encrypted).length
    );
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encrypted), salt.length + iv.length);

    // Convert to base64
    return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt ciphertext with a password
 * @param {string} ciphertext - Base64 encoded ciphertext
 * @param {string} password - Master password used as encryption key
 * @returns {string} Decrypted plaintext
 */
export async function decrypt(ciphertext, password) {
    // Decode base64
    const combined = new Uint8Array(
        atob(ciphertext)
            .split('')
            .map((c) => c.charCodeAt(0))
    );

    // Extract salt, iv, and encrypted data
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const data = combined.slice(28);

    const key = await deriveKey(password, salt);

    const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        data
    );

    return new TextDecoder().decode(decrypted);
}

/**
 * Hash a password using SHA-256
 * @param {string} password - Password to hash
 * @returns {string} Hex-encoded hash
 */
export async function hashPassword(password) {
    const encoder = new TextEncoder();
    const hash = await crypto.subtle.digest('SHA-256', encoder.encode(password));
    return Array.from(new Uint8Array(hash))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}
