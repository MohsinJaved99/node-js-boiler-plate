const { executeQuery, executeQueryAndGetFirst } = require('../helpers/executableQueries');
const {InsertPlaceholders, UpdatePlaceholder} = require('../helpers/servicesHelper');


/**
 * Registers a new user in the database.
 *
 * @param {Object} data - Object containing user data (first_name, last_name, email, password, role_id).
 * @returns {{id: number, user: Object}} - A promise that resolves with an object containing the ID of the newly inserted user and the user data (with password removed), otherwise rejects with an error.
 */
const register = async (data) => {
    try {
        const columns = 'first_name, last_name, email, password, role_id';
        const placeholders = InsertPlaceholders(columns);
        const query = `INSERT INTO users(${columns}) VALUES (${placeholders})`;
        const values = [data.first_name, data.last_name, data.email, data.password, data.role_id];

        const result = await executeQuery(query, values);
        return {
            id: result.insertId,
            user: data
        };
    }
    catch (e) {
        throw e;
    }
}

/**
 * Updates the IP address of a user.
 *
 * @param {number} id - The ID of the user to update.
 * @param {string} ip_address - The new IP address to set.
 * @returns {Promise<Object>} - A promise that resolves with the result of the update operation, otherwise rejects with an error.
 */
const updateUserIpAddress = async (id, ip_address) => {
    try {
        const query = `UPDATE users SET ip_address = ? WHERE id = ?`;
        const values = [ip_address, id];

        return await executeQuery(query, values);
    }
    catch (e) {
        throw e;
    }
}

/**
 * Deletes a reset password entry by email.
 *
 * @param {string} email - The email associated with the reset password entry to delete.
 * @returns {Promise<Object>} - A promise that resolves with the result of the delete operation, otherwise rejects with an error.
 */
const deleteResetPassword = async (email) => {
    try {
        const query = `DELETE FROM reset_password WHERE email = ?`;
        const values = [email];

        return await executeQuery(query, values);
    }
    catch (e) {
        throw e;
    }
}

/**
 * Stores a reset password entry in the database.
 *
 * @param {Object} data - Object containing reset password data (email, token, expires_at).
 * @returns {Promise<Object>} - A promise that resolves with the result of the insert operation, otherwise rejects with an error.
 */
const storeResetPassword = async (data) => {
    try {
        const columns = 'email, token, expires_at'
        const placeholders = InsertPlaceholders(columns);
        const query = `INSERT INTO reset_password(${columns}) VALUES (${placeholders})`;
        const values = [data.email, data.token, data.expires_at];

        return await executeQuery(query, values);
    }
    catch (e) {
        throw e;
    }
}

/**
 * Checks if a reset password token exists in the reset_password table.
 *
 * @param {string} token - The reset password token to check.
 * @returns {Promise<Object>} - A promise that resolves with the reset password entry if the token exists, otherwise null.
 */
const isResetPasswordToken = async (token) => {
    try {
        const query = `SELECT * FROM reset_password WHERE token = ?`
        const values = [token];

        return await executeQueryAndGetFirst(query, values);
    }
    catch (e) {
        throw e;
    }
}

/**
 * Updates the password of a user.
 *
 * @param {Object} data - Object containing user data (password, email).
 * @returns {Promise<Object>} - A promise that resolves with the result of the update operation, otherwise rejects with an error.
 */
const updateUserPassword = async (data) => {
    try {
        const columns = 'password = ?';
        const query = `UPDATE users SET ${columns} WHERE email = ?`;
        const values = [data.password, data.email];

        return await executeQuery(query, values);
    }
    catch (e) {
        throw e;
    }
}

module.exports = {
    register,
    updateUserIpAddress,
    deleteResetPassword,
    storeResetPassword,
    isResetPasswordToken,
    updateUserPassword
}