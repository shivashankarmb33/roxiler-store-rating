const express = require('express');
const router = express.Router();
const {
  getStoreOwnerDashboard,
  getStoreRatings
} = require('../controllers/storeOwnerController');
const { authenticate, authorize } = require('../middleware/auth');

// All store owner routes require authentication and STORE_OWNER role
router.use(authenticate, authorize('STORE_OWNER'));

router.get('/dashboard', getStoreOwnerDashboard);
router.get('/ratings', getStoreRatings);

module.exports = router;

