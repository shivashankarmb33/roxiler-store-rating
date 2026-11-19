const express = require('express');
const router = express.Router();
const {
  submitRating,
  modifyRating,
  getMyRatings
} = require('../controllers/ratingController');
const { authenticate, authorize } = require('../middleware/auth');
const { ratingValidation } = require('../middleware/validation');

// All rating routes require authentication and USER role
router.use(authenticate, authorize('USER'));

router.post('/', ratingValidation, submitRating);
router.put('/:storeId', modifyRating);
router.get('/my-ratings', getMyRatings);

module.exports = router;

