/**
 * ValidationResponse Class
 *
 * Represents a response object used for validation results.
 * It encapsulates details such as success status, message, and validation errors.
 */
class ValidationResponse {
    /**
     * Creates an instance of ValidationResponse.
     *
     * @param {boolean} success - Indicates the success status of the validation.
     * @param {string} message - Message describing the validation result.
     * @param {object} errors - Errors object containing details about validation errors.
     */
    constructor(success, message, errors) {
        this.success = success;
        this.message = message;
        this.errors = errors;
    }
}

module.exports = ValidationResponse;