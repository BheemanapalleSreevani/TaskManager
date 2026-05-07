const { sendError } = require('../utils/responseHandler');

const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Not authenticated.', 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Required role: ${roles.join(' or ')}.`,
        403
      );
    }

    next();
  };
};

// Admin-only shorthand
const adminOnly = roleMiddleware('admin');

module.exports = { roleMiddleware, adminOnly };
