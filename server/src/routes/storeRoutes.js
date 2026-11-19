const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { getStores, getStoreById } = require('../controllers/storeController');

// Optional authentication helper: if valid token present, attach req.user, else continue
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'roxiler_super_secret_jwt_key_2026_secure');
      req.user = decoded;
    } catch {
      // Token invalid or expired, continue as guest
    }
  }
  next();
};

router.get('/', optionalAuth, getStores);
router.get('/:id', optionalAuth, getStoreById);

module.exports = router;
