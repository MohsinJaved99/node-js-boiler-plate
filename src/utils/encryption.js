const crypto = require('crypto');

// Shared key for encryption
const sharedKey = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

// Method to encrypt a string
const encrypt = (string) => {
    const cipher = crypto.createCipheriv('aes-256-cbc', sharedKey, Buffer.alloc(16, 0));
    let encrypted = cipher.update(string, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

// Method to decrypt an encrypted string
const decrypt = (encryptedString) => {
    const decipher = crypto.createDecipheriv('aes-256-cbc', sharedKey, Buffer.alloc(16, 0));
    let decrypted = decipher.update(encryptedString, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

module.exports = {
    encrypt,
    decrypt
}