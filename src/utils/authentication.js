const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

/**
 * Authenticates a user by comparing the provided password with the hashed password stored in the user object.
 * Generates a JWT access token upon successful authentication.
 *
 * @param {Object} user - The user object containing the hashed password to compare.
 * @param {string} password - The password to compare with the hashed password.
 * @return {Promise<Object>} - A promise that resolves to an object indicating success or failure of authentication:
 *   - success {boolean}: Indicates whether authentication was successful.
 *   - accessToken {string}: JWT access token generated upon successful authentication.
 *   - data {Object}: The user object without the password field (if authentication is successful).
 *   - message {string}: Error message indicating invalid credentials (if authentication fails).
 */
const authentication = (user, password) => {
    return new Promise(async (resolve) => {
        //compare password with hashed password
        if (user && (await bcrypt.compare(password, user.password))) {
            user.password = undefined;
            const accessToken = jwt.sign(
                {
                    user
                },
                process.env.JWT_SECRET_KEY,
                {}
            );
            resolve({ success: true, accessToken: accessToken, data: user});
        } else {
            resolve({ success: false, message: 'Invalid credentials, Please try again.'});
        }
    });
}

module.exports = authentication;