const multer = require('multer');

/**
 *
 * @param path
 * @return {Multer}
 */
function createMulterUpload(path) {
    const storage = multer.diskStorage({
        destination: (req, file, callback) => {
            callback(null, path);
        },
        filename: (req, file, callback) => {
            // Ensure req.user.id exists and modify according to your application's authentication method
            const filename = `${req.user.id}-${Date.now()}-${file.originalname}`;
            callback(null, filename);
        }
    });

    return multer({ storage: storage });
}

module.exports = createMulterUpload;
