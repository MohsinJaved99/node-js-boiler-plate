//Route Prefix: /api/otp
const router = require('express').Router();
const otpController = require("../controllers/otpController");

router.post("/verify", otpController.verify);

router.post("/resend", otpController.resend);

module.exports = router;