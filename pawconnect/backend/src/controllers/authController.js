const userModel = require('../models/userModel');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../middleware/auth');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Register a new user
 */
const register = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, userType, phone, shelterName } = req.body;

  // Check if user already exists
  const existingUser = await userModel.findByEmail(email);
  if (existingUser) {
    return errorResponse(res, 'Email already registered', 400);
  }

  // Create user
  const userData = {
    email,
    password,
    firstName,
    lastName,
    userType,
    phone,
  };

  // Add shelter name if registering as shelter
  if (userType === 'shelter' && shelterName) {
    userData.shelterName = shelterName;
  }

  const user = await userModel.createUser(userData);

  // Generate tokens
  const token = generateToken(user.userId, user.userType);
  const refreshToken = generateRefreshToken(user.userId, user.userType);

  successResponse(res, {
    token,
    refreshToken,
    user,
  }, 'Registration successful', 201);
});

/**
 * Login user
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user
  const user = await userModel.findByEmail(email);
  if (!user) {
    return errorResponse(res, 'Invalid email or password', 401);
  }

  // Verify password
  const isPasswordValid = await userModel.verifyPassword(password, user.password);
  if (!isPasswordValid) {
    return errorResponse(res, 'Invalid email or password', 401);
  }

  // Remove password from response
  delete user.password;

  // Generate tokens
  const token = generateToken(user.userId, user.userType);
  const refreshToken = generateRefreshToken(user.userId, user.userType);

  successResponse(res, {
    token,
    refreshToken,
    user,
  }, 'Login successful');
});

/**
 * Refresh access token
 */
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return errorResponse(res, 'Refresh token required', 400);
  }

  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Generate new access token
    const newToken = generateToken(decoded.userId, decoded.userType);

    successResponse(res, {
      token: newToken,
    }, 'Token refreshed successfully');
  } catch (error) {
    return errorResponse(res, 'Invalid refresh token', 401);
  }
});

/**
 * Verify token
 */
const verifyToken = asyncHandler(async (req, res) => {
  // User is already authenticated by middleware
  successResponse(res, {
    valid: true,
    user: req.user,
  }, 'Token is valid');
});

/**
 * Logout (client-side token removal)
 */
const logout = asyncHandler(async (req, res) => {
  successResponse(res, null, 'Logged out successfully');
});

module.exports = {
  register,
  login,
  refreshToken,
  verifyToken,
  logout,
};
