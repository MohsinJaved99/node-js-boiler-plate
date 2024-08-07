const authRoute = require('./authRoute');
const otpRoute = require('./otpRoute');
const storeRoute = require('./storeRoute');

const v1Route = require('./api/v1/v1Route');

module.exports = {
    authRoute,
    otpRoute,
    storeRoute,
    v1Route,
}