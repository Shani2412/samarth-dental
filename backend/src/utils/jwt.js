const jwt    = require('jsonwebtoken');
const config = require('../config/env');

const signToken = (payload) =>
  jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

const verifyToken = (token) =>
  jwt.verify(token, config.jwt.secret);

const extractToken = (req) => {
  const h = req.headers.authorization;
  if (h?.startsWith('Bearer ')) return h.slice(7);
  return null;
};

module.exports = { signToken, verifyToken, extractToken };
