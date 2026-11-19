const { pool } = require('../config/db');

// @desc    Get all stores with average ratings, search, sort, and current user's rating
// @route   GET /api/stores
// @access  Public / Authenticated
const getStores = async (req, res, next) => {
  try {
    const {
      search = '',
      sortBy = 'name',
      sortOrder = 'ASC',
      page = 1,
      limit = 10
    } = req.query;

    const currentUserId = req.user ? req.user.id : null;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    const allowedSortColumns = {
      name: 's.name',
      address: 's.address',
      rating: 'average_rating',
      created_at: 's.created_at'
    };
    const orderColumn = allowedSortColumns[sortBy] || 's.name';
    const direction = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    // Construct WHERE clause
    const whereClauses = [];
    const queryParams = [];

    if (search.trim()) {
      whereClauses.push('(s.name LIKE ? OR s.address LIKE ?)');
      const searchWildcard = `%${search.trim()}%`;
      queryParams.push(searchWildcard, searchWildcard);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Total count query
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM stores s
      ${whereSql}
    `;
    const [countResult] = await pool.query(countQuery, queryParams);
    const totalStores = countResult[0].total;

    // Data query with aggregated ratings and user's own rating
    const dataQuery = `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        s.created_at,
        IFNULL(ROUND(AVG(r.rating), 2), 0) AS average_rating,
        COUNT(r.id) AS total_ratings,
        ${currentUserId ? '(SELECT rating FROM ratings WHERE user_id = ? AND store_id = s.id)' : 'NULL'} AS user_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      ${whereSql}
      GROUP BY s.id
      ORDER BY ${orderColumn} ${direction}
      LIMIT ? OFFSET ?
    `;

    const finalParams = currentUserId 
      ? [currentUserId, ...queryParams, limitNum, offset]
      : [...queryParams, limitNum, offset];

    const [stores] = await pool.query(dataQuery, finalParams);

    return res.status(200).json({
      success: true,
      data: {
        stores: stores.map(store => ({
          ...store,
          average_rating: parseFloat(store.average_rating) || 0,
          total_ratings: parseInt(store.total_ratings, 10) || 0,
          user_rating: store.user_rating !== null ? parseInt(store.user_rating, 10) : null
        })),
        pagination: {
          total: totalStores,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(totalStores / limitNum)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single store by ID
// @route   GET /api/stores/:id
// @access  Public / Authenticated
const getStoreById = async (req, res, next) => {
  try {
    const storeId = parseInt(req.params.id, 10);
    const currentUserId = req.user ? req.user.id : null;

    const dataQuery = `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        s.created_at,
        IFNULL(ROUND(AVG(r.rating), 2), 0) AS average_rating,
        COUNT(r.id) AS total_ratings,
        ${currentUserId ? '(SELECT rating FROM ratings WHERE user_id = ? AND store_id = s.id)' : 'NULL'} AS user_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.id = ?
      GROUP BY s.id
    `;

    const params = currentUserId ? [currentUserId, storeId] : [storeId];
    const [stores] = await pool.query(dataQuery, params);

    if (stores.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Store not found.'
      });
    }

    const store = stores[0];

    return res.status(200).json({
      success: true,
      data: {
        store: {
          ...store,
          average_rating: parseFloat(store.average_rating) || 0,
          total_ratings: parseInt(store.total_ratings, 10) || 0,
          user_rating: store.user_rating !== null ? parseInt(store.user_rating, 10) : null
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStores,
  getStoreById
};

