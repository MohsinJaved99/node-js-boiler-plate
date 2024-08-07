const pool = require('../config/database');
const {createExceptionLogFile} = require("../utils/logs/logger");

/**
 * Executes a query and returns the result rows.
 *
 * @param {string} query - The SQL query to execute.
 * @param {Array<any>} values - The values to use in the query.
 * @returns {Promise<Array<Object>>} A promise that resolves to the result rows of the query.
 * @throws Will throw an error if the query fails.
 */
const executeQuery = async (query, values) => {
    try {
        const [rows] = await pool.query(query, values);

        return rows;
    } catch (err) {
        console.error(err);
        createExceptionLogFile(null, 'database', err);
        throw err; // Re-throw the error after logging it
    }
};

/**
 * Executes a query and returns the first result row.
 *
 * @param {string} query - The SQL query to execute.
 * @param {Array<any>} values - The values to use in the query.
 * @returns {Promise<Object|null>} A promise that resolves to the first row of the result set, or null if no rows are returned.
 * @throws Will throw an error if the query fails.
 */
const executeQueryAndGetFirst = async (query, values) => {
    try {
        const [rows] = await pool.query(query, values);

        return rows.length > 0 ? rows[0] : null;
    } catch (err) {
        console.error(err);
        createExceptionLogFile(null, 'database', err);
        throw err; // Re-throw the error after logging it
    }
}

module.exports = { executeQuery, executeQueryAndGetFirst }