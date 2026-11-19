const { pool } = require('../config/db');

// @desc    Get store owner dashboard stats and store information
// @route   GET /api/store-owner/dashboard
// @access  Private (STORE_OWNER)
const getStoreOwnerDashboard = async (req, res, next) => {
  try {
    const ownerId = req.user.id;

    // Fetch store owned by this user
    const [stores] = await pool.query(
      `SELECT id, name, email, address, created_at
       FROM stores
       WHERE owner_id = ?`,
      [ownerId]
    );

    if (stores.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          hasStore: false,
          store: null,
          stats: {
            averageRating: 0,
            totalRatings: 0,
            distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
          },
          raters: []
        }
      });
    }

    const store = stores[0];

    // Calculate rating statistics
    const [ratingStats] = await pool.query(
      `SELECT 
        IFNULL(ROUND(AVG(rating), 2), 0) AS average_rating,
        COUNT(id) AS total_ratings,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) AS stars_5,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) AS stars_4,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) AS stars_3,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) AS stars_2,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) AS stars_1
       FROM ratings
       WHERE store_id = ?`,
      [store.id]
    );

    const stats = ratingStats[0];

    return res.status(200).json({
      success: true,
      data: {
        hasStore: true,
        store,
        stats: {
          averageRating: parseFloat(stats.average_rating) || 0,
          totalRatings: parseInt(stats.total_ratings, 10) || 0,
          distribution: {
            5: parseInt(stats.stars_5, 10) || 0,
            4: parseInt(stats.stars_4, 10) || 0,
            3: parseInt(stats.stars_3, 10) || 0,
            2: parseInt(stats.stars_2, 10) || 0,
            1: parseInt(stats.stars_1, 10) || 0
          }
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get list of users who rated owner's store with ratings, filter & sort
// @route   GET /api/store-owner/ratings
// @access  Private (STORE_OWNER)
const getStoreRatings = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const {
      search = '',
      rating = '',
      sortBy = 'created_at',
      sortOrder = 'DESC',
      page = 1,
      limit = 10
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    // Check store
    const [stores] = await pool.query('SELECT id FROM stores WHERE owner_id = ?', [ownerId]);
    if (stores.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          ratings: [],
          pagination: { total: 0, page: 1, limit: limitNum, totalPages: 0 }
        }
      });
    }

    const storeId = stores[0].id;

    // Sorting
    const allowedSortColumns = {
      name: 'u.name',
      email: 'u.email',
      rating: 'r.rating',
      created_at: 'r.created_at',
      updated_at: 'r.updated_at'
    };
    const orderColumn = allowedSortColumns[sortBy] || 'r.created_at';
    const direction = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Filters
    const whereClauses = ['r.store_id = ?'];
    const queryParams = [storeId];

    if (search.trim()) {
      whereClauses.push('(u.name LIKE ? OR u.email LIKE ?)');
      const wildcard = `%${search.trim()}%`;
      queryParams.push(wildcard, wildcard);
    }

    if (rating && !isNaN(parseInt(rating, 10))) {
      whereClauses.push('r.rating = ?');
      queryParams.push(parseInt(rating, 10));
    }

    const whereSql = `WHERE ${whereClauses.join(' AND ')}`;

    // Total count
    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       ${whereSql}`,
      queryParams
    );
    const total = countResult[0].total;

    // Data query
    const [ratings] = await pool.query(
      `SELECT 
        r.id,
        r.rating,
        r.created_at,
        r.updated_at,
        u.id AS user_id,
        u.name AS user_name,
        u.email AS user_email,
        u.address AS user_address
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       ${whereSql}
       ORDER BY ${orderColumn} ${direction}
       LIMIT ? OFFSET ?`,
      [...queryParams, limitNum, offset]
    );

    return res.status(200).json({
      success: true,
      data: {
        ratings,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStoreOwnerDashboard,
  getStoreRatings
};

