const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

// @desc    Get dashboard summary statistics
// @route   GET /api/admin/dashboard-stats
// @access  Private (ADMIN)
const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Total users breakdown
    const [userStats] = await pool.query(`
      SELECT 
        COUNT(*) AS total_users,
        SUM(CASE WHEN r.name = 'USER' THEN 1 ELSE 0 END) AS total_normal_users,
        SUM(CASE WHEN r.name = 'STORE_OWNER' THEN 1 ELSE 0 END) AS total_store_owners,
        SUM(CASE WHEN r.name = 'ADMIN' THEN 1 ELSE 0 END) AS total_admins
      FROM users u
      JOIN roles r ON u.role_id = r.id
    `);

    // 2. Total stores
    const [storeStats] = await pool.query('SELECT COUNT(*) AS total_stores FROM stores');

    // 3. Total submitted ratings and average rating overall
    const [ratingStats] = await pool.query(`
      SELECT 
        COUNT(*) AS total_ratings,
        IFNULL(ROUND(AVG(rating), 2), 0) AS average_rating
      FROM ratings
    `);

    // 4. Recent ratings with user and store info
    const [recentRatings] = await pool.query(`
      SELECT 
        r.id,
        r.rating,
        r.created_at,
        r.updated_at,
        u.name AS user_name,
        u.email AS user_email,
        s.name AS store_name
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      JOIN stores s ON r.store_id = s.id
      ORDER BY r.created_at DESC
      LIMIT 5
    `);

    return res.status(200).json({
      success: true,
      data: {
        totalUsers: Number(userStats[0].total_users) || 0,
        totalNormalUsers: Number(userStats[0].total_normal_users) || 0,
        totalStoreOwners: Number(userStats[0].total_store_owners) || 0,
        totalAdmins: Number(userStats[0].total_admins) || 0,
        totalStores: Number(storeStats[0].total_stores) || 0,
        totalRatings: Number(ratingStats[0].total_ratings) || 0,
        averageRating: Number(ratingStats[0].average_rating) || 0,
        recentRatings
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with filtering, sorting, and pagination
// @route   GET /api/admin/users
// @access  Private (ADMIN)
const getUsers = async (req, res, next) => {
  try {
    const {
      search = '',
      role = '',
      sortBy = 'created_at',
      sortOrder = 'DESC',
      page = 1,
      limit = 10
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    // Validate sorting column to prevent SQL injection
    const allowedSortColumns = {
      name: 'u.name',
      email: 'u.email',
      address: 'u.address',
      role: 'r.name',
      created_at: 'u.created_at'
    };
    const orderColumn = allowedSortColumns[sortBy] || 'u.created_at';
    const direction = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Construct WHERE clause
    const whereClauses = [];
    const queryParams = [];

    if (search.trim()) {
      whereClauses.push('(u.name LIKE ? OR u.email LIKE ? OR u.address LIKE ?)');
      const searchWildcard = `%${search.trim()}%`;
      queryParams.push(searchWildcard, searchWildcard, searchWildcard);
    }

    if (role.trim()) {
      whereClauses.push('r.name = ?');
      queryParams.push(role.trim());
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Total count query
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM users u
      JOIN roles r ON u.role_id = r.id
      ${whereSql}
    `;
    const [countResult] = await pool.query(countQuery, queryParams);
    const totalUsers = countResult[0].total;

    // Data query
    const dataQuery = `
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.address, 
        u.role_id, 
        r.name AS role, 
        u.created_at, 
        u.updated_at
      FROM users u
      JOIN roles r ON u.role_id = r.id
      ${whereSql}
      ORDER BY ${orderColumn} ${direction}
      LIMIT ? OFFSET ?
    `;

    const [users] = await pool.query(dataQuery, [...queryParams, limitNum, offset]);

    return res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          total: totalUsers,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(totalUsers / limitNum)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new user (any role: ADMIN, USER, STORE_OWNER)
// @route   POST /api/admin/users
// @access  Private (ADMIN)
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, address, role } = req.body;

    // Check duplicate email
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists.'
      });
    }

    // Find role_id
    const [roles] = await pool.query('SELECT id FROM roles WHERE name = ?', [role]);
    if (roles.length === 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid role specified: ${role}`
      });
    }
    const roleId = roles[0].id;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, address, role_id) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, address || null, roleId]
    );

    const newUser = {
      id: result.insertId,
      name,
      email,
      address: address || null,
      role
    };

    return res.status(201).json({
      success: true,
      message: 'User created successfully.',
      data: { user: newUser }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user details and ratings history / store owner store info
// @route   GET /api/admin/users/:id
// @access  Private (ADMIN)
const getUserDetails = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);

    const [users] = await pool.query(
      `SELECT u.id, u.name, u.email, u.address, u.role_id, r.name AS role, u.created_at, u.updated_at
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    const user = users[0];
    let extraDetails = {};

    if (user.role === 'USER') {
      // Get ratings submitted by this normal user
      const [ratings] = await pool.query(
        `SELECT r.id, r.rating, r.created_at, r.updated_at, s.id AS store_id, s.name AS store_name, s.address AS store_address
         FROM ratings r
         JOIN stores s ON r.store_id = s.id
         WHERE r.user_id = ?
         ORDER BY r.created_at DESC`,
        [userId]
      );
      extraDetails = { submittedRatings: ratings };
    } else if (user.role === 'STORE_OWNER') {
      // Get stores owned by this user and all customer ratings for those stores
      const [ownedStores] = await pool.query(
        `SELECT 
          s.id, 
          s.name, 
          s.email, 
          s.address,
          IFNULL(ROUND(AVG(r.rating), 2), 0) AS average_rating,
          COUNT(r.id) AS total_ratings
         FROM stores s
         LEFT JOIN ratings r ON s.id = r.store_id
         WHERE s.owner_id = ?
         GROUP BY s.id`,
        [userId]
      );

      // Get all customer ratings received across owned stores
      const [ratingsReceived] = await pool.query(
        `SELECT 
          r.id, 
          r.rating, 
          r.created_at, 
          r.updated_at,
          u.name AS user_name, 
          u.email AS user_email,
          s.name AS store_name
         FROM ratings r
         JOIN stores s ON r.store_id = s.id
         JOIN users u ON r.user_id = u.id
         WHERE s.owner_id = ?
         ORDER BY r.created_at DESC`,
        [userId]
      );

      extraDetails = {
        ownedStores,
        ratingsReceived
      };
    }

    return res.status(200).json({
      success: true,
      data: {
        user,
        ...extraDetails
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all stores with filtering, sorting, pagination, and average ratings
// @route   GET /api/admin/stores
// @access  Private (ADMIN)
const getStores = async (req, res, next) => {
  try {
    const {
      search = '',
      sortBy = 'created_at',
      sortOrder = 'DESC',
      page = 1,
      limit = 10
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    const allowedSortColumns = {
      name: 's.name',
      email: 's.email',
      address: 's.address',
      created_at: 's.created_at',
      rating: 'average_rating',
      total_ratings: 'total_ratings'
    };
    const orderColumn = allowedSortColumns[sortBy] || 's.created_at';
    const direction = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Construct WHERE clause
    const whereClauses = [];
    const queryParams = [];

    if (search.trim()) {
      whereClauses.push('(s.name LIKE ? OR s.email LIKE ? OR s.address LIKE ?)');
      const searchWildcard = `%${search.trim()}%`;
      queryParams.push(searchWildcard, searchWildcard, searchWildcard);
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

    // Data query with aggregated ratings & owner info
    const dataQuery = `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        s.owner_id,
        s.created_at,
        s.updated_at,
        u.name AS owner_name,
        u.email AS owner_email,
        IFNULL(ROUND(AVG(r.rating), 2), 0) AS average_rating,
        COUNT(r.id) AS total_ratings
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON s.id = r.store_id
      ${whereSql}
      GROUP BY s.id, u.name, u.email
      ORDER BY ${orderColumn} ${direction}
      LIMIT ? OFFSET ?
    `;

    const [stores] = await pool.query(dataQuery, [...queryParams, limitNum, offset]);

    return res.status(200).json({
      success: true,
      data: {
        stores: stores.map(store => ({
          ...store,
          average_rating: parseFloat(store.average_rating) || 0,
          total_ratings: parseInt(store.total_ratings, 10) || 0
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

// @desc    Create a new store (and optionally assign owner)
// @route   POST /api/admin/stores
// @access  Private (ADMIN)
const createStore = async (req, res, next) => {
  try {
    const { name, email, address, owner_id } = req.body;

    // Check duplicate store email
    const [existing] = await pool.query('SELECT id FROM stores WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A store with this email address already exists.'
      });
    }

    // If owner_id is provided, verify owner is a valid STORE_OWNER
    let assignedOwnerId = null;
    if (owner_id) {
      const [owners] = await pool.query(
        `SELECT u.id, r.name AS role
         FROM users u
         JOIN roles r ON u.role_id = r.id
         WHERE u.id = ? AND r.name = 'STORE_OWNER'`,
        [owner_id]
      );

      if (owners.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Specified owner ID does not exist or is not a Store Owner.'
        });
      }
      assignedOwnerId = owners[0].id;
    }

    const [result] = await pool.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name, email, address, assignedOwnerId]
    );

    return res.status(201).json({
      success: true,
      message: 'Store created successfully.',
      data: {
        store: {
          id: result.insertId,
          name,
          email,
          address,
          owner_id: assignedOwnerId
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get store details with rating breakdown and list of raters
// @route   GET /api/admin/stores/:id
// @access  Private (ADMIN)
const getStoreDetails = async (req, res, next) => {
  try {
    const storeId = parseInt(req.params.id, 10);

    const [stores] = await pool.query(
      `SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        s.owner_id,
        s.created_at,
        s.updated_at,
        u.name AS owner_name,
        u.email AS owner_email,
        IFNULL(ROUND(AVG(r.rating), 2), 0) AS average_rating,
        COUNT(r.id) AS total_ratings
       FROM stores s
       LEFT JOIN users u ON s.owner_id = u.id
       LEFT JOIN ratings r ON s.id = r.store_id
       WHERE s.id = ?
       GROUP BY s.id, u.name, u.email`,
      [storeId]
    );

    if (stores.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Store not found.'
      });
    }

    // Get all user ratings for this store
    const [ratings] = await pool.query(
      `SELECT 
        r.id,
        r.rating,
        r.created_at,
        r.updated_at,
        u.id AS user_id,
        u.name AS user_name,
        u.email AS user_email
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.store_id = ?
       ORDER BY r.created_at DESC`,
      [storeId]
    );

    return res.status(200).json({
      success: true,
      data: {
        store: {
          ...stores[0],
          average_rating: parseFloat(stores[0].average_rating) || 0,
          total_ratings: parseInt(stores[0].total_ratings, 10) || 0
        },
        ratings
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all store owners (for owner assignment select dropdown)
// @route   GET /api/admin/store-owners
// @access  Private (ADMIN)
const getStoreOwnersList = async (req, res, next) => {
  try {
    const [owners] = await pool.query(
      `SELECT u.id, u.name, u.email
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE r.name = 'STORE_OWNER'
       ORDER BY u.name ASC`
    );

    return res.status(200).json({
      success: true,
      data: { owners }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  createUser,
  getUserDetails,
  getStores,
  createStore,
  getStoreDetails,
  getStoreOwnersList
};
