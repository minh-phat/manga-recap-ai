"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptApiKey = encryptApiKey;
exports.decryptApiKey = decryptApiKey;
exports.maskApiKey = maskApiKey;
const crypto_1 = require("crypto");
const ALGORITHM = 'aes-256-gcm';
function deriveKey(secret) {
    return (0, crypto_1.createHash)('sha256').update(secret).digest();
}
function encryptApiKey(plainText, secret) {
    const key = deriveKey(secret);
    const iv = (0, crypto_1.randomBytes)(12);
    const cipher = (0, crypto_1.createCipheriv)(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([
        cipher.update(plainText, 'utf8'),
        cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}
function decryptApiKey(payload, secret) {
    const key = deriveKey(secret);
    const buffer = Buffer.from(payload, 'base64');
    const iv = buffer.subarray(0, 12);
    const authTag = buffer.subarray(12, 28);
    const encrypted = buffer.subarray(28);
    const decipher = (0, crypto_1.createDecipheriv)(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}
function maskApiKey(plainText) {
    if (plainText.length <= 4)
        return '****';
    return `********${plainText.slice(-4)}`;
}
//# sourceMappingURL=crypto.util.js.map