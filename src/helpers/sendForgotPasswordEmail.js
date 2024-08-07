const bcrypt = require("bcrypt");
const authServices = require("../services/authServices");
const {generateRandomNumbers} = require("../helpers");
const forgotPasswordEmailTemplate = require("../email_templates/forgotPasswordEmailTemplate");
const sendEmail = require("../utils/sendEmailUtility");
const moment = require("moment-timezone");
const {encrypt} = require("../utils/encryption");

const sendForgotPasswordEmail = async (email, first_name) => {
    return new Promise(async (resolve, reject) => {
        const expires_at = moment(new Date()).add(10, 'minute').unix();
        const type = "reset-password"
        const token = await encrypt(`${email},${type}`);
        const url = `${process.env.CLIENT_URL}/reset-password/${token}`;
        const html = forgotPasswordEmailTemplate(url, first_name);
        const subject = `Reset Password | ${process.env.APP_NAME}`;
        await authServices.deleteResetPassword(email);
        await authServices.storeResetPassword({email, token, expires_at});
        const emailResponse = await sendEmail(email, subject, html);
        if(emailResponse.status === 200) {
            resolve(emailResponse)
        }
        else {
            reject(emailResponse)
        }
    });
}

module.exports = sendForgotPasswordEmail;