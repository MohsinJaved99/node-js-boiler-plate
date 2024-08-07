const fs = require('fs');
const path = require('path');

//return current timestamp for log
function getCurrentTimestamp() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} | UNIX ${Math.floor(Date.now() / 1000)}`;
}

//return current date
function getCurrentDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}_${month}_${day}`;
}

/**
 * Creates or appends to a log file with error messages. The log file is named based on the current date and the type of error.
 *
 * @param {Object} req - The request object.
 * @param {string} filename - The name of the file where the error occurred.
 * @param {string | Error | Object} error - The error message or object to log.
 * @returns {void}
 */
function createExceptionLogFile(req, filename, error) {
    const logTimestamp = getCurrentTimestamp();
    const type = filename.includes('\\') ? filename.split('\\')[filename.split('\\').length - 1].replace('.js', '') : filename;
    /** requestCode - [UniqueCode-Timestamp-UserId]*/
    const requestCode = req?.requestCode ? '[' + req.requestCode + ']' : '';
    /**logMessage - [Request Code] [Timestamps] Error Message*/
    const logMessage = `${requestCode} [${logTimestamp}] ${typeof error === 'object' ? JSON.stringify(error) : error}\n\n`;
    const logDate = getCurrentDate();
    /** logFilePath - src/logs/Date_ErrorFileName_errors.log*/
    const logFilePath = path.join(__dirname, '..', '..' , 'logs', 'exceptions', `${logDate}_${type}_errors.log`);

    //Check if file do not exist, then create a file
    if (!fs.existsSync(logFilePath)) {
        fs.writeFile(logFilePath, '', (err) => {
            if (err) {
                console.error('Error creating log file:', err);
            } else {
                console.log(`Log file created ${logDate}_${type}_errors.log:`, logFilePath);
            }
        });
    }

    //Append the new log at the bottom of log file
    fs.appendFile(logFilePath, logMessage, (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
        } else {
            console.log(`Log appended to ${logDate}_${type}_errors.log:`, logMessage);
        }
    });
}

/**
 * Creates or appends to a log file with activity messages. The log file is named based on the current date and the type of error.
 *
 * @param {Object} req - The request object.
 * @param {string} filename - The name of the file where the error occurred.
 * @param {string | Object} activity - The activity message or object to log.
 * @returns {void}
 */
function createActivityLogFile(filename, activity) {
    const logTimestamp = getCurrentTimestamp();
    /**logMessage - [Request Code] [Timestamps] Activity Message*/
    const logMessage = `[${logTimestamp}] ${typeof activity === 'object' ? JSON.stringify(activity) : activity}\n\n`;
    const logDate = getCurrentDate();
    /** logFilePath - src/logs/Date_ErrorFileName_errors.log*/
    const logFilePath = path.join(__dirname, '..', '..' , 'logs', 'activities', `${logDate}_${filename}_activity.log`);

    //Check if file do not exist, then create a file
    if (!fs.existsSync(logFilePath)) {
        fs.writeFile(logFilePath, '', (err) => {
            if (err) {
                console.error('Error creating log file:', err);
            } else {
                console.log(`Log file created ${logDate}_${filename}_activity.log:`, logFilePath);
            }
        });
    }

    //Append the new log at the bottom of log file
    fs.appendFile(logFilePath, logMessage, (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
        } else {
            console.log(`Log appended to ${logDate}_${filename}_activity.log:`, logMessage);
        }
    });
}

/**
 * Logs messages to the console in development mode only. Messages are formatted for readability.
 *
 * @param {...any} args - The messages or objects to log.
 * @returns {void}
 */
const developmentLogger = (...args) => {
    try{
        if (process.env.NODE_ENV && process.env.NODE_ENV === 'development') {
            const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, " ") : arg).join(' ');
            console.log('\x1b[1m%s\x1b[0m', message); // Log the message with bold styling
        }
    }
    catch (e) {
        console.log('developmentLogger',e)
    }
}

module.exports = {
    createExceptionLogFile,
    createActivityLogFile,
    developmentLogger
};