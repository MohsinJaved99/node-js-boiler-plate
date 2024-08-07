const cloudinary = require('../../config/cloudinaryConfig');
const axios = require('axios');
const { PDFDocument } = require('pdf-lib');

/**
 * Retrieves the secure URL of a PDF asset stored in Cloudinary.
 *
 * @param {string} assetId - The ID of the asset in Cloudinary.
 * @return {Promise<string>} - A promise that resolves to the secure URL of the PDF asset.
 * @throws {Error} - Throws an error if the asset is not found or is not a PDF.
 */
const getPdfFromCloudinary = async (assetId) => {
    try {
        // Retrieve details of the asset from Cloudinary
        const asset = await cloudinary.api.resource(assetId);

        if (asset && asset.secure_url && asset.format === 'pdf') {
            return asset.secure_url;
        } else {
            throw new Error('Asset not found or is not a PDF');
        }
    } catch (error) {
        throw new Error(`Failed to retrieve asset: ${error.message}`);
    }
};

/**
 * Retrieves multiple PDFs from Cloudinary based on their asset IDs, merges them into a single PDF document,
 * and returns the merged PDF as a buffer.
 *
 * @param {string[]} assetIds - An array of asset IDs of PDFs stored in Cloudinary.
 * @return {Promise<Uint8Array>} - A promise that resolves to a buffer containing the merged PDF document.
 * @throws {Error} - Throws an error if any of the PDF retrieval or merging processes fail.
 */
const getMergedPdfFromCloudinary = async (assetIds) => {
    try {
        const pdfUrls = await Promise.all(assetIds.map(getPdfFromCloudinary));
        const pdfBuffers = await Promise.all(pdfUrls.map(url => axios.get(url, { responseType: 'arraybuffer' })));

        const mergedPdf = await PDFDocument.create();
        for (const pdfBuffer of pdfBuffers) {
            const pdfDoc = await PDFDocument.load(pdfBuffer.data);
            const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
            copiedPages.forEach(page => mergedPdf.addPage(page));
        }

        return await mergedPdf.save();
    } catch (error) {
        throw new Error(`Failed to merge PDFs: ${error.message}`);
    }
};

module.exports = {
    getPdfFromCloudinary,
    getMergedPdfFromCloudinary
};