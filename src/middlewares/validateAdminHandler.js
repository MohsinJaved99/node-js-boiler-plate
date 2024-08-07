const jwt = require("jsonwebtoken");
const Response = require('../models/responses')
const { StatusCodes } = require('../config')

/**
 * Middleware function to validate and authorize requests from administrative users using JWT authentication.
 * Ensures that only authorized administrators can access restricted endpoints.
 *
 * Functionality:
 * 1. Token Verification:
 *    - Checks if the JWT token is present in the Authorization header of the incoming request.
 *    - Returns a 400 Bad Request status if the token is missing or incorrectly formatted.
 *
 * 2. JWT Decoding:
 *    - Verifies the JWT token using the application's JWT_SECRET_KEY.
 *    - Decodes the token payload to extract user details.
 *
 * 3. User Status Check:
 *    - Ensures that the user's account status is active (status === 1).
 *    - Returns a 401 Unauthorized status if the user account is blocked.
 *
 * 4. Role Authorization:
 *    - Checks if the user has an admin role (role_id === 1).
 *    - Returns a 403 Forbidden status if the user does not have admin privileges.
 *
 * 5. Request Code Handling:
 *    - Appends the user's ID to req.requestCode for tracking or logging purposes.
 *
 * 6. Error Handling:
 *    - Catches exceptions during token verification or decoding.
 *    - Returns a 500 Internal Server Error status with detailed error information.
 *
 * Usage:
 * - Apply this middleware to routes or controllers where administrative access is required.
 * - Enhances security by restricting access to sensitive endpoints to authorized administrators only.
 *
 * Example Usage:
 * ```
 * router.get('/', validateAdminHandler, (req, res) => {
 *   // Route logic for admin dashboard
 * });
 * ```
 */
const validateAdminHandler = async (req, res, next) => {
    try {
        let token;
        let authHeader = req.headers.Authorization || req.headers.authorization;

        if (!authHeader) {
            return res.status(StatusCodes.HTTP_400_BAD_REQUEST).json(new Response.genericResponse(false, 'User is not authorized or token is missing.'));
        }

        if (authHeader && authHeader.startsWith("Bearer")) {
            token = authHeader.split(" ")[1];
            jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
                if (err) {
                    return res.status(StatusCodes.HTTP_401_UNAUTHORIZED).json(new Response.genericResponse(false, 'Unauthorized.'));
                }
                req.user = decoded.user;

                if(decoded.user.status !== 1) {
                    return res.status(StatusCodes.HTTP_401_UNAUTHORIZED).json(new Response.genericResponse(false, 'User account is blocked. Please contact support for assistance.'));
                }

                if(decoded.user.role_id !== 1){
                    return res.status(StatusCodes.HTTP_403_FORBIDDEN).json(new Response.genericResponse(false, 'Access denied! This endpoint is restricted to administrators only.'));
                }

                req.requestCode = `${req.requestCode}-${decoded.user.id}`;

                next();
            });
        }
        else {
            return res.status(StatusCodes.HTTP_401_UNAUTHORIZED).json(new Response.genericResponse(false, 'User is not authorized or token is missing.'));
        }
    }
    catch (e) {
        return res.status(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR).json(new Response.catchResponse(req, e, __filename));
    }
};

module.exports = validateAdminHandler;
