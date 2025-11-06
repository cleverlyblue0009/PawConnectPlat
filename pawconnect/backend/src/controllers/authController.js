const userModel = require('../models/userModel');
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

  successResponse(res, {
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

  successResponse(res, {
    user,
  }, 'Login successful');
});

/**
 * Verify user
 */
const verifyUser = asyncHandler(async (req, res) => {
  // User is already authenticated by middleware
  successResponse(res, {
    valid: true,
    user: req.user,
  }, 'User is valid');
});

/**
 * Logout (client-side cleanup)
 */
const logout = asyncHandler(async (req, res) => {
  successResponse(res, null, 'Logged out successfully');
});

module.exports = {
  register,
  login,
  verifyUser,
  logout,
};
