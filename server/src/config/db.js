const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'roxiler_store_rating',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test connection helper
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✓ Successfully connected to MySQL database');
    connection.release();
    return true;
  } catch (error) {
    console.error('✗ Failed to connect to MySQL database:', error.message);
    throw error;
  }
}

module.exports = {
  pool,
  testConnection
};

