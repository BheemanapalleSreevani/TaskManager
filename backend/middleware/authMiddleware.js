const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/responseHandler');

const authMiddleware = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 'Not authorized. No token provided.', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return sendError(res, 'User not found.', 401);
    }

    if (!user.isActive) {
      return sendError(res, 'Account is deactivated.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 'Not authorized. Invalid token.', 401);
  }
};

module.exports = authMiddleware;
