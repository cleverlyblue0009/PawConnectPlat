const shelterModel = require('../models/shelterModel');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get all shelters
 */
const getAllShelters = asyncHandler(async (req, res) => {
  const shelters = await shelterModel.getAllShelters();

  successResponse(res, shelters, 'Shelters retrieved successfully');
});

/**
 * Get shelter by ID with pets
 */
const getShelterById = asyncHandler(async (req, res) => {
  const { shelterId } = req.params;

  try {
    const shelter = await shelterModel.getShelterWithPets(shelterId);
    successResponse(res, shelter, 'Shelter retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
});

/**
 * Update shelter information
 */
const updateShelter = asyncHandler(async (req, res) => {
  const { shelterId } = req.params;

  // Check authorization
  if (req.user.userId !== shelterId) {
    return errorResponse(res, 'Unauthorized', 403);
  }

  try {
    const updatedShelter = await shelterModel.updateShelter(shelterId, req.body);
    successResponse(res, updatedShelter, 'Shelter updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
});

/**
 * Get shelter statistics
 */
const getShelterStats = asyncHandler(async (req, res) => {
  const { shelterId } = req.params;

  // Check authorization
  if (req.user.userId !== shelterId) {
    return errorResponse(res, 'Unauthorized', 403);
  }

  const stats = await shelterModel.getShelterStats(shelterId);

  successResponse(res, stats, 'Shelter statistics retrieved successfully');
});

module.exports = {
  getAllShelters,
  getShelterById,
  updateShelter,
  getShelterStats,
};
