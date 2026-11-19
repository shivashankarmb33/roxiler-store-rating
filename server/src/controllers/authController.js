const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { generateToken } = require('../utils/token');

// @desc    Register a new normal user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, address } = req.body;

    // Check if user already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Get USER role id
    const [roles] = await pool.query("SELECT id FROM roles WHERE name = 'USER'");
    const userRoleId = roles.length > 0 ? roles[0].id : 2;

    // Insert user
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, address, role_id) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, address || null, userRoleId]
    );

    const user = {
      id: result.insertId,
      name,
      email,
      address: address || null,
      role: 'USER'
    };

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      data: {
        token,
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log in user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user with role
    const [users] = await pool.query(
      `SELECT u.id, u.name, u.email, u.password, u.address, u.role_id, r.name AS role
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.email = ?`,
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const user = users[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role
    };

    const token = generateToken(safeUser);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      data: {
        token,
        user: safeUser
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      user: req.user
    }
  });
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Fetch current hashed password
    const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, users[0].password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match.'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, userId]);

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  changePassword
};
