const {createExceptionLogFile} = require("../../utils/logs/logger");
/** CatchResponse Class
*
* Represents a response object used for handling caught errors in a request.
* It encapsulates details such as success status, request code, error message,
* stack trace (if available), and optionally logs the error to a file.
*/
class CatchResponse {
    /**
     * Creates an instance of CatchResponse.
     *
     * @param {object} req - The request object associated with the caught error.
     * @param {Error} error - The error object or message caught during request processing.
     * @param {string} filename - Optional filename where the error should be logged.
     */
    constructor(req, error, filename) {
        this.success = false;
        this.requestCode = req.requestCode;
        this.message = 'Something went wrong';
        this.error_message = error.message;
        if(error.stack) {
            this.stack = error.stack;
        }
        if(filename) {
            createExceptionLogFile(req, filename, error.stack ? error.stack : error.message);
        }
    }
}

module.exports = CatchResponse;