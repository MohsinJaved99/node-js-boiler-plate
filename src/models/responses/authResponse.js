/**
 * AuthResponse Class
 *
 * Represents an authentication response object used to encapsulate
 * authentication status, messages, user role, authentication token,
 * and additional data.
 */
class AuthResponse {
    /**
     * Creates an instance of AuthResponse.
     *
     * @param {boolean} success - Indicates whether the authentication operation was successful.
     * @param {string} message - A message describing the authentication status or outcome.
     * @param {string} role - The role or type of the authenticated user.
     * @param {string} token - The authentication token associated with the user session.
     * @param {object} data - Additional data related to the authentication response.
     * @throws {object} Throws an error if token is not provided.
     */
    constructor(success, message, role, token, data) {
        if (!token) {
            throw { message: "Token is required" }
        }
        this.success = success;
        this.message = message;
        this.role = role;
        this.token = token;
        this.data = data;
    }
}

module.exports = AuthResponse;