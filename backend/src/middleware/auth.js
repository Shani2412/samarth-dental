const prisma                  = require('../config/db');
const { verifyToken, extractToken } = require('../utils/jwt');
const { error }               = require('../utils/response');

async function authenticate(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) return error(res, 'Authentication required', 401);
    const decoded = verifyToken(token);
    const user    = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return error(res, 'User not found', 401);
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') return error(res, 'Session expired. Please login again.', 401);
    return error(res, 'Invalid token', 401);
  }
}

function requireAdmin(req, res, next) {
  authenticate(req, res, () => {
    if (req.user.role !== 'ADMIN') return error(res, 'Admin access required', 403);
    next();
  });
}

module.exports = { authenticate, requireAdmin };
