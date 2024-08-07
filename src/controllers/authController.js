const {developmentLogger} = require("../utils/logs/logger");
const Response = require('../models/responses')
const authServices = require('../services/authServices');
const userServices = require('../services/userServices');
const {validatePayload} = require('../utils/validation/requestValidationUtitily');
const {hashPassword} = require('../utils/passwordUtility');
const {encrypt, decrypt} = require('../utils/encryption');
const sendOtpEmail = require('../helpers/sendOtpEmail');
const sendForgotPasswordEmail = require('../helpers/sendForgotPasswordEmail');
const authentication = require('../utils/authentication');
const requestIp = require('request-ip');
const {create} = require('../utils/storeUtility');
const resetPasswordUtility = require('../utils/resetPasswordUtility');
const { StatusCodes, AppConfig } = require('../config')

const register = async (req, res) => {
    try {
        const payload = req.body;
        const validate = await validatePayload(payload, {
            first_name: 'required',
            last_name: 'required',
            email: 'required|email',
            password: 'required|minLength:8',
        });
        if(!validate.success) {
            return res.status(StatusCodes.HTTP_422_UNPROCESSABLE_ENTITY).json(new Response.validationResponse(false, 'Validation failed.', validate.errors));
        }

        const isEmailExist = await userServices.isUserExistByEmail(payload.email);
        if(isEmailExist) {
            return res.status(StatusCodes.HTTP_409_CONFLICT).json(new Response.genericResponse(false, 'Email already exist.'));
        }

        payload.password = await hashPassword(payload.password);
        payload.role_id = 2;

        await authServices.register(payload);

        await sendOtpEmail(payload.email, payload.first_name, 'account-verification');

        return res.status(StatusCodes.HTTP_200_OK).json(new Response.genericResponse(true, 'Your account has been created successfully. An OTP has been sent to your email, Please verify your account.'));

    }
    catch (e) {
        return res.status(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR).json(new Response.catchResponse(req, e, __filename));
    }
}

const login = async (req, res) => {
    try {
        const payload = req.body;
        const validate = await validatePayload(payload, {
            email: 'required|email',
            password: 'required',
        });
        if(!validate.success) {
            return res.status(StatusCodes.HTTP_422_UNPROCESSABLE_ENTITY).json(new Response.validationResponse(false, 'Validation failed.', validate.errors));
        }

        const user = await userServices.getUserByEmail(payload.email, true, false);
        if(!user) {
            return res.status(StatusCodes.HTTP_404_NOT_FOUND).json(new Response.genericResponse(false, 'User does not exist.'));
        }

        if(user.status === 0) {
            return res.status(StatusCodes.HTTP_403_FORBIDDEN).json(new Response.genericResponse(false, 'Account is blocked, Please contact support.'));
        }

        if(user.is_verified === 0) {
            await sendOtpEmail(payload.email, user.first_name, 'account-verification');
            return res.status(StatusCodes.HTTP_200_OK).json(new Response.genericResponse(true, 'An OTP has been sent to your email, Please verify your account.'));
        }

        const auth = await authentication(user, payload.password);
        if(auth.success) {
            const clientIp = requestIp.getClientIp(req);
            await authServices.updateUserIpAddress(user.id, clientIp);
            res.status(StatusCodes.HTTP_200_OK).json(new Response.authResponse(
                true,
                `${user.role_id === 1 ? 'Admin' : 'User'} logged in successfully.`,
                AppConfig.ROLES[user.role_id],
                auth.accessToken,
                auth.data
            ));
        }
        else {
            res.status(StatusCodes.HTTP_401_UNAUTHORIZED).json(new Response.genericResponse(
                false,
                auth.message
            ));
        }
    }
    catch (e) {
        return res.status(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR).json(new Response.catchResponse(req, e, __filename));
    }
}

const forgot = async (req, res) => {
    try {
        const payload = req.body;
        const validate = await validatePayload(payload, {
            email: 'required|email'
        });
        if(!validate.success) {
            return res.status(StatusCodes.HTTP_422_UNPROCESSABLE_ENTITY).json(new Response.validationResponse(false, 'Validation failed.', validate.errors));
        }

        const isEmailExist = await authServices.isEmailExist(payload.email);
        if(!isEmailExist) {
            return res.status(StatusCodes.HTTP_409_CONFLICT).json(new Response.genericResponse(false, 'Email do not exist.'));
        }

        const user = await userServices.getUserByEmail(payload.email, false, false);
        await sendForgotPasswordEmail(payload.email, user.first_name);

        return res.status(StatusCodes.HTTP_200_OK).json(new Response.genericResponse(true, 'Reset password link has been to your email.'));
    }
    catch (e) {
        return res.status(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR).json(new Response.catchResponse(req, e, __filename));
    }
}

const reset = async (req, res) => {
    try {
        const payload = req.body;
        const validate = await validatePayload(payload, {
            token: 'required',
            password: 'required|minLength:8'
        });
        if(!validate.success) {
            return res.status(StatusCodes.HTTP_422_UNPROCESSABLE_ENTITY).json(new Response.validationResponse(false, 'Validation failed.', validate.errors));
        }

        const resetPassword = await resetPasswordUtility(req);

        return res.status(resetPassword.statusCode).json(resetPassword.response);
    }
    catch (e) {
        return res.status(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR).json(new Response.catchResponse(req, e, __filename));
    }
}

module.exports = {
    register,
    login,
    forgot,
    reset
}