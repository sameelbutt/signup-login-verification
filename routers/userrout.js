let express = require('express');
let authController = require('./../controllers/auth');
let router = express.Router();

// Corrected the typo in the route path
router.post('/signup', authController.signup);
router.post('/verify', authController.verifyAccount);
router.post('/login', authController.login);

module.exports = router;
