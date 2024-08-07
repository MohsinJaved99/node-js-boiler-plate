const {hashPassword} = require('./passwordUtility');
const authServices = require('../services/authServices');
const Response = require('../models/responses');
const { StatusCodes } = require('../config');

/**
 * Utility function for handling password reset based on token verification.
 * Verifies the reset password token, checks expiration, decrypts the token,
 * validates the token contents, and updates the user's password if valid.
 *
 * @param {Object} req - The request object containing the token and password payload.
 * @return {Promise<Object>} - A promise that resolves to an object indicating the result of the password reset operation:
 *   - statusCode {number}: HTTP status code indicating the result of the operation.
 *   - response {Object}: A Response object indicating success or failure of the password reset operation:
 *     - success {boolean}: Indicates whether the password was updated successfully.
 *     - message {string}: Detailed message describing the result of the password reset operation.
 * @throws {Response.genericResponse} - Throws a generic response error if the reset token is invalid or expired.
 */
const resetPasswordUtility = (req) => {
    return new Promise(( async (resolve) => {
        try {
            const payload = req.body;
            const result = await authServices.isResetPasswordToken(payload.token);
            if(!result) {
                return resolve({
                    statusCode: StatusCodes.HTTP_403_FORBIDDEN,
                    response: new Response.genericResponse(false, 'Invalid token.')
                });
            }
            const expires_at = result.expires_at;
            let current_time = moment(new Date()).unix();
            if (current_time >= expires_at) {
                return resolve({
                    statusCode: StatusCodes.HTTP_401_UNAUTHORIZED,
                    response: new Response.genericResponse(false, 'Reset password link expired.')
                });
            }

            const decryptedToken = await decrypt(payload.token).toString().split(",");
            if(decryptedToken && decryptedToken.length > 1) {
                const email = decryptedToken[0];
                const type = decryptedToken[1];

                if(email !== result.email) {
                    return resolve({
                        statusCode: StatusCodes.HTTP_403_FORBIDDEN,
                        response: new Response.genericResponse(false, 'Invalid token.')
                    });
                }

                const isEmailExist = await authServices.isEmailExist(email);
                if(!isEmailExist) {
                    return resolve({
                        statusCode: StatusCodes.HTTP_403_FORBIDDEN,
                        response: new Response.genericResponse(false, 'Invalid token.')
                    });
                }

                if(type === 'reset-password') {
                    const hashedPassword = await hashPassword(payload.password);
                    await authServices.updateUserPassword({email, password: hashedPassword});
                    await authServices.deleteResetPassword(email);
                }
                else {
                    return resolve({
                        statusCode: StatusCodes.HTTP_403_FORBIDDEN,
                        response: new Response.genericResponse(false, 'Invalid token.')
                    });
                }
            }
            else {
                return resolve({
                    statusCode: StatusCodes.HTTP_403_FORBIDDEN,
                    response: new Response.genericResponse(false, 'Invalid token.')
                });
            }

            return resolve({
                statusCode: StatusCodes.HTTP_200_OK,
                response: new Response.genericResponse(true, 'Password updated successfully.')
            });
        }
        catch (e) {
            return resolve({
                statusCode: StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR,
                response: new Response.catchResponse(req, e, __filename)
            });
        }
    }))

}

module.exports = resetPasswordUtility;