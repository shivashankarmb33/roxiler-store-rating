const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getUsers,
  createUser,
  getUserDetails,
  getStores,
  createStore,
  getStoreDetails,
  getStoreOwnersList
} = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');
const {
  createUserValidation,
  createStoreValidation
} = require('../middleware/validation');

// All admin routes require authentication and ADMIN role
router.use(authenticate, authorize('ADMIN'));

// Dashboard stats
router.get('/dashboard-stats', getDashboardStats);

// User management
router.get('/users', getUsers);
router.post('/users', createUserValidation, createUser);
router.get('/users/:id', getUserDetails);

// Store management
router.get('/stores', getStores);
router.post('/stores', createStoreValidation, createStore);
router.get('/stores/:id', getStoreDetails);
router.get('/store-owners', getStoreOwnersList);

module.exports = router;

