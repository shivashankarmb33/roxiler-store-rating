const { pool } = require('../config/db');

// @desc    Submit or update a rating for a store (1 to 5)
// @route   POST /api/ratings
// @access  Private (USER)
const submitRating = async (req, res, next) => {
  try {
    const { store_id, rating } = req.body;
    const userId = req.user.id;

    // Check that store exists
    const [stores] = await pool.query('SELECT id, name FROM stores WHERE id = ?', [store_id]);
    if (stores.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Store not found.'
      });
    }

    // Insert or update rating (handles both new submission and modification)
    // Uses MySQL ON DUPLICATE KEY UPDATE ensuring exactly 1 rating per user per store
    await pool.query(
      `INSERT INTO ratings (user_id, store_id, rating)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         rating = VALUES(rating), 
         updated_at = CURRENT_TIMESTAMP`,
      [userId, store_id, rating]
    );

    // Fetch updated store statistics
    const [stats] = await pool.query(
      `SELECT 
        IFNULL(ROUND(AVG(rating), 2), 0) AS average_rating,
        COUNT(id) AS total_ratings
       FROM ratings
       WHERE store_id = ?`,
      [store_id]
    );

    return res.status(200).json({
      success: true,
      message: 'Rating saved successfully.',
      data: {
        store_id,
        user_rating: rating,
        average_rating: parseFloat(stats[0].average_rating) || 0,
        total_ratings: parseInt(stats[0].total_ratings, 10) || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Modify previously submitted rating by store ID
// @route   PUT /api/ratings/:storeId
// @access  Private (USER)
const modifyRating = async (req, res, next) => {
  try {
    const storeId = parseInt(req.params.storeId, 10);
    const { rating } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5.'
      });
    }

    // Verify rating exists for this user and store
    const [existing] = await pool.query(
      'SELECT id FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No existing rating found for this store to modify. Please submit a new rating.'
      });
    }

    await pool.query(
      'UPDATE ratings SET rating = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND store_id = ?',
      [rating, userId, storeId]
    );

    // Fetch updated store stats
    const [stats] = await pool.query(
      `SELECT 
        IFNULL(ROUND(AVG(rating), 2), 0) AS average_rating,
        COUNT(id) AS total_ratings
       FROM ratings
       WHERE store_id = ?`,
      [storeId]
    );

    return res.status(200).json({
      success: true,
      message: 'Rating updated successfully.',
      data: {
        store_id: storeId,
        user_rating: rating,
        average_rating: parseFloat(stats[0].average_rating) || 0,
        total_ratings: parseInt(stats[0].total_ratings, 10) || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all ratings submitted by the current user
// @route   GET /api/ratings/my-ratings
// @access  Private (USER)
const getMyRatings = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [ratings] = await pool.query(
      `SELECT 
        r.id,
        r.rating,
        r.created_at,
        r.updated_at,
        s.id AS store_id,
        s.name AS store_name,
        s.address AS store_address,
        s.email AS store_email,
        (SELECT IFNULL(ROUND(AVG(sub_r.rating), 2), 0) FROM ratings sub_r WHERE sub_r.store_id = s.id) AS store_average_rating,
        (SELECT COUNT(sub_r.id) FROM ratings sub_r WHERE sub_r.store_id = s.id) AS store_total_ratings
       FROM ratings r
       JOIN stores s ON r.store_id = s.id
       WHERE r.user_id = ?
       ORDER BY r.updated_at DESC`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      data: {
        ratings: ratings.map(r => ({
          ...r,
          store_average_rating: parseFloat(r.store_average_rating) || 0,
          store_total_ratings: parseInt(r.store_total_ratings, 10) || 0
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitRating,
  modifyRating,
  getMyRatings
};

