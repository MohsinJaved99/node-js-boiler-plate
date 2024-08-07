const cloudinary = require('../config/cloudinaryConfig');
const streamifier = require('streamifier');

/**
 * Uploads a file buffer to Cloudinary storage.
 *
 * @param {Buffer} fileBuffer - The buffer containing the file data to upload.
 * @param {string} folderPath - The path of the folder in Cloudinary where the file should be stored.
 * @param {string|null} fileName - Optional. The name to be assigned to the uploaded file. If not provided, a default name based on folderPath and timestamp will be used.
 * @return {Promise<Object>} - A promise that resolves to the Cloudinary upload result object upon successful upload.
 * @throws {Error} - Throws an error if fileBuffer or folderPath is missing, or if any error occurs during the upload process.
 */
const uploadFileToCloud = async (fileBuffer, folderPath, fileName = null) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!fileBuffer) {
                reject(new Error("Image buffer is required"));
            }

            if(!folderPath) {
                reject(new Error("folderPath is required"));
            }

            let file_name = fileName ? fileName : `${folderPath.toString().replaceAll('/', '-')}-${new Date().valueOf()}`;

            if(fileName) {
                // Check if the file already exists
                const existingFile = await cloudinary.search
                    .expression(`folder:${folderPath} AND filename:${file_name}`)
                    .execute();
                if (existingFile.resources.length > 0) {
                    // File exists, delete it
                    await cloudinary.uploader.destroy(`${folderPath}/${file_name}`);
                }
            }

            // Upload the new file
            let stream = cloudinary.uploader.upload_stream(
                { folder: folderPath, public_id: file_name },
                (error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                }
            );
            streamifier.createReadStream(fileBuffer).pipe(stream);
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = uploadFileToCloud;