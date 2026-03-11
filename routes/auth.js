const express = require('express');
const { register, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * We don't need a traditional /login route here.
 * The frontend uses Firebase SDK to login, gets an ID token, 
 * and sends that token in the Authorization header to our protected routes.
 * 
 * The /register route is used ONCE right after the user signs up on Firebase
 * so we can store their business/customer details in our PostgreSQL DB.
 */

router.post('/register', register);

// Protected routes
router.get('/me', protect, getMe);

module.exports = router;
