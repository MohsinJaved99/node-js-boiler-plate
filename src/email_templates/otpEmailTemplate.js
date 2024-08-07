const otpEmailTemplate = (url, first_name, otp) => {
    return `<html lang="UTF-8">
            <head>
                <title>OTP | ${process.env.APP_NAME}</title>
            </head>
            <body>
                <h1>${process.env.APP_NAME}</h1>
                <h4>Hi${first_name ? " " + first_name : null},</h4>
                <h4>Your OTP is ${otp}</h4>
            </body>
        </html>`;
}

module.exports = otpEmailTemplate;