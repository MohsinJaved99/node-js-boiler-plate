const addressAbbreviations = require('../config/addressAbbreviations');
const moment = require('moment-timezone');

const generateRandomNumbers = (length) => {
    let result = '';
    let characters = '0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function getCurrentUnixTimestamp() {
    return Math.floor(Date.now() / 1000); // Convert milliseconds to seconds
}

function stringToBoolean(str) {
    return str === 'true';
}

const decodeTimestamp = (base36Timestamp) => {
    // Convert the base-36 string back to a base-10 number
    return parseInt(base36Timestamp, 36);
}

/**
 * Convert a given timestamp to the specified format.
 *
 * @param {string} timestamp - The timestamp to convert (e.g., '2024-07-22T11:29:44.000Z').
 * @param {number} offset - The number of hours to offset from UTC (e.g., 5 for +05:00).
 * @returns {string} The formatted date and time string (e.g., '2024-07-22 16:29:44').
 */
function convertUTCToDatabaseTimestamp(timestamp, offset = process.env.SERVER_TIMEZONE_OFFSET) {
    // Create a Date object from the timestamp
    const date = new Date(timestamp);

    // Extract the year, month, day, hours, minutes, and seconds
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // getUTCMonth() is zero-based
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours() + offset).padStart(2, '0'); // Adding offset hours to convert from UTC to desired timezone
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');

    // Format the date and time string
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function calculateGirth(length, width, height) {
    const dim = [
        parseFloat(length),
        parseFloat(width),
        parseFloat(height)
    ];

    dim.sort(function(a, b) {
        return a - b;
    });

    const sumOfTwoSmallest = dim[0] + dim[1];

    const multiplySumByTwo = sumOfTwoSmallest * 2;

    return multiplySumByTwo + dim[2];
}

/**
 * Method is use to convert address line by replacing the abbreviation in the string. (i.e. Convert ROAD to RD)
 *
 * @param {string} address_line - Address line string to convert.
 * @return {string} Return the converted address line string.
 */
function convertAddressByAbbreviation(address_line) {
    if (address_line) {
        for (const item of addressAbbreviations) {
            const regex = new RegExp(`\\b${item.name}\\b`, 'gi'); // Create a case-insensitive
            address_line = address_line.replace(regex, item.abbreviation); // Replace the word with the
        }
    }
    return address_line;
}

/**
 * Get the start of the day in UTC for a given number of days ago
 * @param {number} daysAgo - Number of days to subtract from the current day
 * @returns {string} - ISO string representing the start of the day in UTC
 */
function getStartOfDayUTC(daysAgo) {
    // Get the current date and time in UTC
    const now = new Date();

    // Clone the date to avoid modifying the original `now` date object
    const targetDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    // Subtract the given number of days
    targetDate.setUTCDate(targetDate.getUTCDate() - daysAgo);

    // Create a new Date object for the start of the calculated day in UTC
    const startOfDayUTC = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate(), 0, 0, 0));

    // Return the start of the day as an ISO string
    return startOfDayUTC.toISOString();
}

function convertFormattedDateToTimestamp(formatted_date, timezone = process.env.DEFAULT_TIMEZONE) {
    // moment(formatted_date, 'DD').tz(timezone).utc(false).format('DD') EXAMPLE FOR FUTURE USE

    //formatted_date i.e. 03 July 2024 03:30 AM
    const splitData = formatted_date.split(" ");

    switch (splitData.length) {
        case 1:
            return moment(formatted_date, 'DD', true).isValid() ?
                moment(formatted_date, 'DD').utc(true).format('DD') :
                null;
        case 2:
            return moment(formatted_date, 'DD MMMM', true).isValid() ?
                moment(formatted_date, 'DD MMMM').utc(true).format('MM-DD') :
                null;
        case 3:
            return moment(formatted_date, 'DD MMMM YYYY', true).isValid() ?
                moment(formatted_date, 'DD MMMM YYYY').utc(true).format('YYYY-MM-DD') :
                null;
    }
}

module.exports = {
    generateRandomNumbers,
    getCurrentUnixTimestamp,
    stringToBoolean,
    decodeTimestamp,
    convertUTCToDatabaseTimestamp,
    calculateGirth,
    convertAddressByAbbreviation,
    getStartOfDayUTC,
    convertFormattedDateToTimestamp
};