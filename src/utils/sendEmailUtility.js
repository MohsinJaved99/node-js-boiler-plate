const nodeMailer = require("nodemailer");

/**
 * Sends an email using Node mailer with the provided email details.
 *
 * @param {string} email - The recipient's email address.
 * @param {string} subject - The subject line of the email.
 * @param {string} html - The HTML content of the email.
 * @return {Promise<Object>} - A promise that resolves to an object indicating the result of the email sending operation:
 *   - status {number}: HTTP status code indicating the result of the operation (200 for success).
 *   - message {string}: Description of the result of the email sending operation.
 * @throws {Object} - Throws an error object with status and message properties if email, subject, or html is missing.
 */
const sendEmail = async (email, subject, html) => {
    return new Promise(async (resolve, reject) => {
        if(!email || !subject || !html) {
            return reject({
                status: 401,
                message: "Email, Submit and HTML is required"
            })
        }

        let transporter = nodeMailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: process.env.EMAIL_SECURE === "true",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        let mailOptions = {
            subject: subject,
            from: `${process.env.APP_NAME} <${process.env.EMAIL_USER}>`,
            html: html,
            to: email
        };

        await transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log("Email failed",err);
                reject(err);
            } else {
                resolve({
                    status: 200,
                    message: "Email sent successfully"
                });
            }
        });
    })
}

module.exports = sendEmail;