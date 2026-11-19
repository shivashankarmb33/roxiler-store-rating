const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role || (user.role_name ? user.role_name : undefined)
    },
    process.env.JWT_SECRET || 'roxiler_super_secret_jwt_key_2026_secure',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
};

module.exports = {
  generateToken
};

