const bcrypt = require("bcrypt");
const otpServices = require("../services/otpServices");
const {generateRandomNumbers} = require("../helpers");
const otpEmailTemplate = require("../email_templates/otpEmailTemplate");
const sendEmail = require("../utils/sendEmailUtility");
const moment = require("moment-timezone");
const {encrypt} = require("../utils/encryption");

/**
 * Generates an OTP (One-Time Password), hashes it using bcrypt,
 * generates an encryption token, sends an OTP email with a generated URL,
 * and stores the OTP information in the database.
 *
 * @param {string} email - The recipient's email address.
 * @param {string} first_name - The recipient's first name.
 * @param {string} type - The type of OTP (e.g., registration, password-reset).
 * @returns {Promise<Object>} - A promise that resolves with the email sending status, otherwise rejects with an error.
 */
const sendOtpEmail = async (email, first_name, type) => {
    return new Promise(async (resolve, reject) => {
        const otp = await generateRandomNumbers(6);
        const code = await bcrypt.hash(otp, 10);
        const expires_at = moment(new Date()).add(10, 'minute').unix();
        const token = await encrypt(`${email},${type}`);
        const url = `${process.env.CLIENT_URL}/verify/${token}`;
        const html = otpEmailTemplate(url, first_name, otp);
        const subject = `OTP | ${process.env.APP_NAME}`;
        await otpServices.storeOTP({token, code, expires_at});
        const emailResponse = await sendEmail(email, subject, html);
        if(emailResponse.status === 200) {
            resolve(emailResponse)
        }
        else {
            reject(emailResponse)
        }
    });
}

module.exports = sendOtpEmail;