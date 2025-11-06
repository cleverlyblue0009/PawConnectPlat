const { errorResponse } = require('../utils/responseHandler');
const userModel = require('../models/userModel');

/**
 * Simple authentication middleware
 * Expects userId in request header
 */
const authenticate = async (req, res, next) => {
  try {
    // Get userId from header
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return errorResponse(res, 'User ID required', 401);
    }

    // Get user from database
    const user = await userModel.findById(userId);

    if (!user) {
      return errorResponse(res, 'User not found', 401);
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, 'Authentication failed', 401);
  }
};

/**
 * Verify user is a shelter
 */
const isShelter = (req, res, next) => {
  if (req.user.userType !== 'shelter') {
    return errorResponse(res, 'Access denied. Shelter account required.', 403);
  }
  next();
};

/**
 * Verify user is an adopter
 */
const isAdopter = (req, res, next) => {
  if (req.user.userType !== 'adopter') {
    return errorResponse(res, 'Access denied. Adopter account required.', 403);
  }
  next();
};

/**
 * Optional authentication - doesn't fail if no userId
 */
const optionalAuth = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];

    if (userId) {
      const user = await userModel.findById(userId);
      
      if (user) {
        req.user = user;
      }
    }
  } catch (error) {
    // Continue without authentication
  }
  
  next();
};

module.exports = {
  authenticate,
  isShelter,
  isAdopter,
  optionalAuth,
};
