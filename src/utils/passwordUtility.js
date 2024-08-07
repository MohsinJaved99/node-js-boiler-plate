const {compare, hash} = require('bcrypt');

/**
 * Hashes a password using bcrypt with a specified salt round.
 *
 * @param {string} password - The password to hash.
 * @return {Promise<string>} - A promise that resolves to the hashed password string.
 */
const hashPassword = async (password) => {
    return new Promise((resolve, reject) => {
        hash(password, Number(process.env.PASSWORD_SALT_ROUND) || 10, (err, result) => {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
};

/**
 * Compares a password with a hashed password to determine if they match.
 *
 * @param {string} password - The plain text password to compare.
 * @param {string} hashedPassword - The hashed password to compare against.
 * @return {Promise<boolean>} - A promise that resolves to true if the passwords match, otherwise false.
 */
const comparePassword = async (password, hashedPassword) => {
    return new Promise((resolve, reject) => {
       compare(password, hashedPassword,  async (err, result) => {
           if (err) {
               reject(err);
           }
           else {
               resolve(result);
           }
       });
    });
};

module.exports = {
    hashPassword,
    comparePassword
};