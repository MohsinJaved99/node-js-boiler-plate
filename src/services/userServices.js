const { executeQuery, executeQueryAndGetFirst } = require('../helpers/executableQueries');

/**
 * Retrieves user details from the database based on the provided email address.
 *
 * @param {string} email - The email address of the user.
 * @param {boolean} passwordVisibility - Optional. Determines whether to include the password in the retrieved data.
 * @param {boolean} activeStatus - Optional. If true, retrieves only active users (status = 1).
 * @returns {Promise<Object>} - A promise that resolves with the user object if found, otherwise rejects with an error.
 */
const getUserByEmail = async (email, passwordVisibility = false, activeStatus = false) => {
    try {
        const columns = `id, role_id, first_name, last_name, email, is_verified, mfa_enabled, status, created_at, updated_at ${passwordVisibility?', password':''}`
        const query = `SELECT ${columns} FROM users WHERE email = ? ${activeStatus ? 'AND status = 1' : ''}`;
        const values = [email];

        return await executeQueryAndGetFirst(query, values);
    }
    catch (e) {
        throw e;
    }
}

/**
 * Retrieves user details from the database based on the provided user ID.
 *
 * @param {number} id - The ID of the user.
 * @param {boolean} passwordVisibility - Optional. Determines whether to include the password in the retrieved data.
 * @returns {Promise<Object>} - A promise that resolves with the user object if found, otherwise rejects with an error.
 */
const getUserByID = async (id, passwordVisibility = false) => {
    try {
        const columns = `id, role_id, first_name, last_name, email, is_verified, mfa_enabled, status, created_at, updated_at ${passwordVisibility?', password':''}`
        const query = `SELECT ${columns} FROM users WHERE id = ?`;
        const values = [id];

        return await executeQueryAndGetFirst(query, values);
    }
    catch (e) {
        throw e;
    }
}


/**
 * Checks if an email exists in the users table.
 *
 * @param {string} email - The email to check.
 * @returns {Promise<boolean>} - A promise that resolves with true if the email exists, otherwise false.
 */
const isUserExistByEmail = async (email) => {
    try {
        const query = `SELECT count(id) as count FROM users WHERE email = ?`;
        const values = [email];

        const result = await executeQueryAndGetFirst(query, values);
        return result.count !== 0;
    }
    catch (e) {
        throw e;
    }
}

/**
 * Checks if an id exists in the users table.
 *
 * @param {number} id - The id to check.
 * @returns {Promise<boolean>} - A promise that resolves with true if the id exists, otherwise false.
 */
const isUserExistByID = async (id) => {
    try {
        const query = `SELECT count(id) as count FROM users WHERE id = ?`;
        const values = [id]

        const result = await executeQueryAndGetFirst(query, values);
        return result.count !== 0;
    }
    catch (e) {
        throw e;
    }
}

module.exports = {
    getUserByEmail,
    getUserByID,
    isUserExistByEmail,
    isUserExistByID
}