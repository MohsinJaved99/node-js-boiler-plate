const jwt = require("jsonwebtoken");
const Response = require('../models/responses');
const { StatusCodes } = require('../config');

/**
 * Middleware function to validate and authorize requests from users using JWT authentication.
 * Validates requests made by users (role_id === 2) and sub-users (role_id === 3).
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
 *    - Returns a 403 Forbidden status if the user account is blocked or inactive.
 *
 * 4. Email Verification Check:
 *    - Checks if the user's email is verified (is_verified === 1) for non-admin roles.
 *    - Returns a 403 Forbidden status if the user is unverified.
 *
 * 5. Role Authorization:
 *    - Restricts access to users with role_id equal to 2 (user) or 3 (sub-user).
 *    - Returns a 401 Unauthorized status if the user role is not authorized.
 *
 * 6. Request Code Handling:
 *    - Appends the user's ID to req.requestCode for tracking or logging purposes.
 *
 * 7. Error Handling:
 *    - Catches exceptions during token verification or decoding.
 *    - Returns a 500 Internal Server Error status with detailed error information.
 *
 * Usage:
 * - Apply this middleware to routes or controllers where user authentication and role-based access control is required.
 * - Ensures that only authenticated users with specified roles (user or sub-user) can access protected endpoints.
 *
 * Example Usage:
 * ```
 * router.get('/', validateUserHandler, (req, res) => {
 *   // Route logic for user dashboard
 * });
 * ```
 */
const validateUserHandler = async (req, res, next) => {
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

                //Check if user blocked or inactive
                if(decoded.user.status !== 1) {
                    return res.status(StatusCodes.HTTP_403_FORBIDDEN).json(new Response.genericResponse(false, 'User account is blocked. Please contact support for assistance.'));
                }

                //Check if user is verified
                if(decoded.user.status === 1 && decoded.user.is_verified === 0) {
                    return res.status(StatusCodes.HTTP_403_FORBIDDEN).json(new Response.genericResponse(false, 'Unverified user, Please verify your email.'));
                }

                //Check is user is active and user
                if(decoded.user.role_id !== 2 && decoded.user.role_id !== 3){
                    return res.status(StatusCodes.HTTP_401_UNAUTHORIZED).json(new Response.genericResponse(false, 'Access denied.'));
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

module.exports = validateUserHandler;
