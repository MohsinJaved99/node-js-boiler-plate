/**
 * GenericResponse Class
 *
 * Represents a generic response object used for various types of responses.
 * It encapsulates details such as success status, message, and optional data payload.
 */
class GenericResponse {
    /**
     * Creates an instance of GenericResponse.
     *
     * @param {boolean} success - Indicates the success status of the operation.
     * @param {string} message - Message describing the result of the operation.
     * @param {Object|Array} [data] - Optional Object or Array containing information of the operation.
     * @param {Object|Array} [meta_data] - Optional Object or Array containing meta information of the operation.
     */
    constructor(success, message, data, meta_data) {
        this.success = success;
        this.message = message;
        if (data !== undefined) {
            this.data = data;
        }
        if (meta_data !== undefined) {
            this.meta_data = meta_data;
        }
    }
}

module.exports = GenericResponse;