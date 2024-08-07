require("dotenv").config();
const compression = require('compression');
const app = require('express')();
const cors = require('cors');
const bodyParser = require('body-parser');
const {generateRandomNumbers, getCurrentUnixTimestamp} = require('./src/helpers');
const {AppConfig, StatusCodes} = require('./src/config');
const Response = require('./src/models/responses')
const routes = require('./src/routes');
const { connectRedis } = require('./src/redis');

// Trust the reverse proxy (Enable this to get clients IP Address in request)
app.set('trust proxy', true);

app.use(compression({
    level: 9, // Highest level
    threshold: 0 // gip the response from 0B
}));

app.use(cors());

// parse application/json
app.use(bodyParser.json({ limit: process.env.BODY_PARSE_LIMIT, extended: true }));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ limit: process.env.BODY_PARSE_LIMIT, extended: true }));

//Generate a request code
app.use((req, res, next) => {
    req.requestCode = generateRandomNumbers(4) + "-" + getCurrentUnixTimestamp();
    next();
});

// Portal Auth Router
app.use(AppConfig.ROUTE_PREFIX.auth, routes.authRoute);

// OTP Router
app.use(AppConfig.ROUTE_PREFIX.otp, routes.otpRoute);

// Store Router
app.use(AppConfig.ROUTE_PREFIX.stores, routes.storeRoute);

// API Router
app.use(AppConfig.ROUTE_PREFIX.v1, routes.v1Route);

//Server Health Checker
app.get('/health-checker', (req, res) => {
    return res.send(`<h1>Server is running at Port: ${process.env.PORT || 3008}`);
});

// 404 Response
app.use((req, res) => {
    return res.status(StatusCodes.HTTP_404_NOT_FOUND).send(new Response.genericResponse(false, `Requesting resource not found.`));
});

app.listen(process.env.PORT || 3008, async () => {
    console.info("--> Server is running at Port:", (process.env.PORT || 3008));
    await connectRedis();
});