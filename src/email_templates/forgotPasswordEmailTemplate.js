const forgotPasswordEmailTemplate = (url, first_name) => {
    return `<html lang="UTF-8">
            <head>
                <title>Reset Password | ${process.env.APP_NAME}</title>
            </head>
            <body>
                <h1>${process.env.APP_NAME}</h1>
                <h4>Hi${first_name ? " " + first_name : null},</h4>
                <h4>Please reset you password by clicking the link below.</h4><br/>
                <a href='${url}'>${url}</a>
            </body>
        </html>`;
}

module.exports = forgotPasswordEmailTemplate;