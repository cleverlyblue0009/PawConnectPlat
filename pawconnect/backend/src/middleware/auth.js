const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/responseHandler');
const userModel = require('../models/userModel');

/**
 * Verify JWT token and authenticate user
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'No token provided', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await userModel.findById(decoded.userId);

    if (!user) {
      return errorResponse(res, 'User not found', 401);
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Invalid token', 401);
    }
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token expired', 401);
    }
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
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userModel.findById(decoded.userId);
      
      if (user) {
        req.user = user;
      }
    }
  } catch (error) {
    // Continue without authentication
  }
  
  next();
};

/**
 * Generate JWT token
 */
const generateToken = (userId, userType) => {
  return jwt.sign(
    { userId, userType },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

/**
 * Generate refresh token
 */
const generateRefreshToken = (userId, userType) => {
  return jwt.sign(
    { userId, userType },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

/**
 * Verify refresh token
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

module.exports = {
  authenticate,
  isShelter,
  isAdopter,
  optionalAuth,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
};
