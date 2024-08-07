const { v1: uuidv1, v3: uuidv3, v4: uuidv4, v5: uuidv5 } = require('uuid');
const AppConfig = require('../config/appConfig');
const crypto = require('crypto');

const namespace = uuidv4(); // Create a namespace using v4 (or use a predefined one)
const name = AppConfig.APP_NAME;

const getV1UUID = () => {
    return uuidv1();
}

const getV3UUID = () => {
    return uuidv3(name, namespace);
}

const getV4UUID = () => {
    return uuidv4();
}

const getV5UUID = () => {
    return uuidv5(name, namespace);
}
/**
 * Generates a unique identifier (UUID) based on the provided type and optional parameters for prefix and additional random characters.
 *
 * @param {string} type - A required parameter that indicates the type or category of the UUID.
 * @param {string|null} prefix - A prefix to be added at the beginning of the UUID. Defaults to the environment variable UUID_PREFIX if not provided.
 * @param {number|null} extraCharacters - The number of extra random characters to append to the UUID. Defaults to 4 bytes (8 hex characters) if not specified.
 *
 * @returns {string} - The generated UUID.
 */
const generateUUID = (type, prefix = null, extraCharacters = null) => {
    // Get the current epoch timestamp in milliseconds
    const timestamp = Date.now();

    // Convert the timestamp to a base-36 string
    const shortTimestamp = timestamp.toString(36);

    // Generate a shorter random string (e.g., 8 characters)
    const randomCharactersString = crypto.randomBytes(extraCharacters || 4).toString('hex');

    // Combine the prefix, shortened timestamp, and random string
    return `${prefix || process.env.UUID_PREFIX}_${type}_${shortTimestamp}${randomCharactersString}`;
}


module.exports = {
    getV1UUID,
    getV3UUID,
    getV4UUID,
    getV5UUID,
    generateUUID
}

