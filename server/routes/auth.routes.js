const express = require('express');
const rateLimit = require('express-rate-limit');
const { login, solicitarReset, resetPassword } = require('../controllers/auth.controller');

const router = express.Router();
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 10,
	standardHeaders: true,
	legacyHeaders: false,
	message: { message: 'Demasiados intentos. Intenta de nuevo más tarde.' }
});

router.post('/login', authLimiter, login);
router.post('/solicitar-reset', authLimiter, solicitarReset);
router.post('/reset-password', authLimiter, resetPassword);

module.exports = router;
