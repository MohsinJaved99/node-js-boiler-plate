const userServices = require('../services/userServices');
const optServices = require('../services/otpServices');

/**
 * Processes the verification of an OTP (One Time Password) based on email and type.
 * Updates user verification status for account verification type.
 *
 * @param {string} email - The email address associated with the user.
 * @param {string} type - The type of OTP verification process ('account-verification' for account verification).
 * @return {Promise<boolean>} - A promise that resolves to true if the OTP verification process is successful.
 * @throws {Error} - Throws an error if something goes wrong during the OTP verification process.
 */
const verifiedOtpProcess = async (email, type) => {
    try {
        const user = await userServices.getUserByEmail(email);
        switch (type) {
            case 'account-verification':
                await optServices.updateUserVerification(user.id, 1);
        }

        return true;
    }
    catch (e) {
        throw new Error("Something went wrong.")
    }
}

module.exports = verifiedOtpProcess;