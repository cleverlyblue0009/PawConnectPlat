const userModel = require('../models/userModel');
const favoritesModel = require('../models/favoritesModel');
const { uploadToS3 } = require('../utils/s3Utils');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get user profile
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = req.user;

  successResponse(res, user, 'Profile retrieved successfully');
});

/**
 * Update user profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  // Handle profile image upload if provided
  let updates = { ...req.body };
  
  if (req.file) {
    const imageUrl = await uploadToS3(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      'users'
    );
    updates.profileImage = imageUrl;
  }

  const updatedUser = await userModel.updateUser(userId, updates);

  successResponse(res, updatedUser, 'Profile updated successfully');
});

/**
 * Get user by ID (public profile)
 */
const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await userModel.findById(userId);

  if (!user) {
    return errorResponse(res, 'User not found', 404);
  }

  // Return only public information
  const publicProfile = {
    userId: user.userId,
    userType: user.userType,
    firstName: user.firstName,
    lastName: user.lastName,
    city: user.city,
    state: user.state,
    profileImage: user.profileImage,
    ...(user.userType === 'shelter' && {
      shelterName: user.shelterName,
      shelterDescription: user.shelterDescription,
      website: user.website,
      verified: user.verified,
    }),
  };

  successResponse(res, publicProfile, 'User retrieved successfully');
});

/**
 * Add pet to favorites
 */
const addFavorite = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { petId } = req.params;

  await favoritesModel.addFavorite(userId, petId);

  successResponse(res, { favorited: true }, 'Pet added to favorites');
});

/**
 * Remove pet from favorites
 */
const removeFavorite = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { petId } = req.params;

  await favoritesModel.removeFavorite(userId, petId);

  successResponse(res, { favorited: false }, 'Pet removed from favorites');
});

/**
 * Get user's favorite pet IDs
 */
const getFavorites = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const favorites = await favoritesModel.getUserFavorites(userId);

  successResponse(res, favorites, 'Favorites retrieved successfully');
});

/**
 * Get user's favorite pets with full details
 */
const getFavoritePets = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const pets = await favoritesModel.getUserFavoritePets(userId);

  successResponse(res, pets, 'Favorite pets retrieved successfully');
});

module.exports = {
  getProfile,
  updateProfile,
  getUserById,
  addFavorite,
  removeFavorite,
  getFavorites,
  getFavoritePets,
};
