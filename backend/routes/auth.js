const express = require('express');
const router = express.Router();
const { register, login, getMe, logout, getAllUsers } = require('../controllers/authController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);
router.post('/logout', auth, logout);
router.get('/users', auth, checkRole('admin'), getAllUsers);

module.exports = router;
