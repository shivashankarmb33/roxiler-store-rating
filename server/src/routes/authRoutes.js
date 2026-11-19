const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  changePassword
} = require('../controllers/authController');
const {
  registerValidation,
  loginValidation,
  changePasswordValidation
} = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');

// Public auth routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Private auth routes
router.get('/profile', authenticate, getProfile);
router.put('/change-password', authenticate, changePasswordValidation, changePassword);

module.exports = router;
