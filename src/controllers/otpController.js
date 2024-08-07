const { StatusCodes } = require('../config');
const Response = require("../models/responses");

const bcrypt = require("bcrypt");
const otpServices = require("../services/otpServices");
const userServices = require("../services/userServices");
const {validatePayload} = require('../utils/validation/requestValidationUtitily');
const {decrypt} = require('../utils/encryption');
const moment = require('moment-timezone');
const sendOtpEmail = require('../helpers/sendOtpEmail');
const verifiedOtpProcess = require('../utils/verifiedOtpProcess');

const verify = async (req, res) => {
    try {
        const payload = req.body;
        const validate = await validatePayload(payload, {
            email: 'required|email',
            token: 'required',
            otp: 'required',
            type: 'required'
        });
        if(!validate.success) {
            return res.status(StatusCodes.HTTP_422_UNPROCESSABLE_ENTITY).json(new Response.validationResponse(false, 'Validation failed.', validate.errors));
        }
        const otpData = await otpServices.getOtpByToken(payload);
        if(otpData) {
            const decryptedToken = await decrypt(payload.token);
            if(decryptedToken.split(',').length <= 1 || (decryptedToken.split(',')[0] !== payload.email || decryptedToken.split(',')[1] !== payload.type)) {
                return res.status(StatusCodes.HTTP_401_UNAUTHORIZED).json(new Response.genericResponse(
                    false,
                    "Access denied, Invalid token."
                ));
            }

            const otp_expire_at = otpData.expires_at;
            let current_datetime = moment(new Date()).unix();
            if (current_datetime >= otp_expire_at) {
                return res.status(StatusCodes.HTTP_401_UNAUTHORIZED).json(new Response.genericResponse(
                    false,
                    "OTP expired."
                ));
            }

            if(await bcrypt.compare(payload.otp, otpData.code)) {
                await verifiedOtpProcess(payload.email, payload.type);
                await otpServices.destroyOtp(payload.token);
                return res.status(StatusCodes.HTTP_200_OK).json(new Response.genericResponse(200, "OTP verified successfully."))
            }
            else {
                return res.status(StatusCodes.HTTP_401_UNAUTHORIZED).json(new Response.genericResponse(
                    false,
                    "Invalid OTP, Please try again."
                ));
            }
        }
        else {
            return res.status(StatusCodes.HTTP_401_UNAUTHORIZED).json(new Response.genericResponse(
                false,
                "Invalid Token, Please try again."
            ));
        }
    }
    catch (e) {
        return res.status(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR).json(new Response.catchResponse(req, e, __filename));
    }
}

const resend = async (req, res) => {
    try {
        const payload = req.body;
        const validate = await validatePayload(payload, {
            token: 'required'
        });
        if(!validate.success) {
            return res.status(StatusCodes.HTTP_422_UNPROCESSABLE_ENTITY).json(new Response.validationResponse(false, 'Validation failed.', validate.errors));
        }
        const otpData = await otpServices.getOtpByToken(payload);
        if(otpData) {
            const decryptedToken = await decrypt(payload.token);
            if(decryptedToken.split(',').length <= 1) {
                return res.status(StatusCodes.HTTP_401_UNAUTHORIZED).json(new Response.genericResponse(
                    false,
                    "Access denied, Invalid token."
                ));
            }

            await otpServices.destroyOtp(payload.token);

            const email = decryptedToken.split(",")[0];

            const user = await userServices.getUserByEmail({email}, false, true);
            if(!user) {
                return res.status(StatusCodes.HTTP_401_UNAUTHORIZED).json(new Response.genericResponse(
                    false,
                    "User does not exist or is blocked."
                ));
            }

            await sendOtpEmail(email, user.first_name, 'account-verification');

            return res.status(StatusCodes.HTTP_200_OK).json(new Response.genericResponse(true, 'An OTP has been resent to your email.'));
        }
        else {
            return res.status(StatusCodes.HTTP_401_UNAUTHORIZED).json(new Response.genericResponse(
                false,
                "Invalid Token, Please try again."
            ));
        }
    }
    catch (e) {
        return res.status(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR).json(new Response.catchResponse(req, e, __filename));
    }
}

module.exports = {
    verify,
    resend
}