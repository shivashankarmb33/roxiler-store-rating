const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');
const storeRoutes = require('./storeRoutes');
const ratingRoutes = require('./ratingRoutes');
const storeOwnerRoutes = require('./storeOwnerRoutes');

// API Health Check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Roxiler Store Rating API'
  });
});

// Mount modular sub-routers
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/stores', storeRoutes);
router.use('/ratings', ratingRoutes);
router.use('/store-owner', storeOwnerRoutes);

module.exports = router;

