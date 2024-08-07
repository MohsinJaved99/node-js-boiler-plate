//Route Prefix: /api/auth
const router = require('express').Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);

router.post('/login', authController.login);

router.post('/forgot-password', authController.forgot);

router.post('/reset-password', authController.reset);

module.exports = router;