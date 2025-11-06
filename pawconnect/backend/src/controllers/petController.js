const petModel = require('../models/petModel');
const { uploadMultipleToS3, deleteMultipleFromS3 } = require('../utils/s3Utils');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHandler');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Create a new pet listing
 */
const createPet = asyncHandler(async (req, res) => {
  const shelterId = req.user.userId;

  // Handle image uploads
  let imageUrls = [];
  if (req.files && req.files.length > 0) {
    imageUrls = await uploadMultipleToS3(req.files, 'pets');
  }

  // Validate minimum images
  if (imageUrls.length < 1) {
    return errorResponse(res, 'At least 1 image is required', 400);
  }

  const petData = {
    ...req.body,
    shelterId,
    images: imageUrls,
    characteristics: req.body.characteristics ? JSON.parse(req.body.characteristics) : [],
  };

  const pet = await petModel.createPet(petData);

  successResponse(res, pet, 'Pet created successfully', 201);
});

/**
 * Get all pets with filters
 */
const getPets = asyncHandler(async (req, res) => {
  const filters = {
    species: req.query.species,
    gender: req.query.gender,
    minAge: req.query.minAge,
    maxAge: req.query.maxAge,
    city: req.query.city,
    state: req.query.state,
    size: req.query.size,
    query: req.query.query,
    sortBy: req.query.sortBy || 'createdAt',
    sortOrder: req.query.sortOrder || 'desc',
    limit: req.query.limit || 20,
    offset: req.query.offset || 0,
  };

  const result = await petModel.searchPets(filters);

  paginatedResponse(
    res,
    result.pets,
    result.total,
    filters.limit,
    filters.offset,
    'Pets retrieved successfully'
  );
});

/**
 * Search pets by name or breed
 */
const searchPets = asyncHandler(async (req, res) => {
  const query = req.query.query;

  if (!query) {
    return errorResponse(res, 'Search query is required', 400);
  }

  const result = await petModel.searchPets({ query, limit: 50 });

  successResponse(res, result.pets, 'Search results retrieved');
});

/**
 * Get pet by ID
 */
const getPetById = asyncHandler(async (req, res) => {
  const { petId } = req.params;

  const pet = await petModel.findById(petId);

  if (!pet) {
    return errorResponse(res, 'Pet not found', 404);
  }

  successResponse(res, pet, 'Pet retrieved successfully');
});

/**
 * Get similar pets
 */
const getSimilarPets = asyncHandler(async (req, res) => {
  const { petId } = req.params;

  const pets = await petModel.getSimilarPets(petId, 3);

  successResponse(res, pets, 'Similar pets retrieved successfully');
});

/**
 * Update pet
 */
const updatePet = asyncHandler(async (req, res) => {
  const { petId } = req.params;
  const shelterId = req.user.userId;

  // Check if pet exists and belongs to this shelter
  const pet = await petModel.findById(petId);
  if (!pet) {
    return errorResponse(res, 'Pet not found', 404);
  }

  if (pet.shelterId !== shelterId) {
    return errorResponse(res, 'Unauthorized to update this pet', 403);
  }

  // Handle image updates
  let updates = { ...req.body };
  
  // Parse existingImages if provided (from frontend)
  let existingImages = [];
  if (updates.existingImages) {
    existingImages = typeof updates.existingImages === 'string' 
      ? JSON.parse(updates.existingImages) 
      : updates.existingImages;
    delete updates.existingImages; // Remove from updates as it's not a DB field
  }

  // Handle new image uploads
  if (req.files && req.files.length > 0) {
    const newImageUrls = await uploadMultipleToS3(req.files, 'pets');
    updates.images = [...existingImages, ...newImageUrls];
  } else if (existingImages.length > 0) {
    // Only update with existing images if no new files uploaded
    updates.images = existingImages;
  }

  if (updates.characteristics && typeof updates.characteristics === 'string') {
    updates.characteristics = JSON.parse(updates.characteristics);
  }

  const updatedPet = await petModel.updatePet(petId, updates);

  successResponse(res, updatedPet, 'Pet updated successfully');
});

/**
 * Delete pet
 */
const deletePet = asyncHandler(async (req, res) => {
  const { petId } = req.params;
  const shelterId = req.user.userId;

  // Check if pet exists and belongs to this shelter
  const pet = await petModel.findById(petId);
  if (!pet) {
    return errorResponse(res, 'Pet not found', 404);
  }

  if (pet.shelterId !== shelterId) {
    return errorResponse(res, 'Unauthorized to delete this pet', 403);
  }

  // Delete images from S3
  if (pet.images && pet.images.length > 0) {
    try {
      await deleteMultipleFromS3(pet.images);
    } catch (error) {
      console.error('Error deleting images from S3:', error);
      // Continue with pet deletion even if S3 deletion fails
    }
  }

  await petModel.deletePet(petId);

  successResponse(res, null, 'Pet deleted successfully');
});

/**
 * Get pets by shelter
 */
const getPetsByShelter = asyncHandler(async (req, res) => {
  const { shelterId } = req.params;

  const pets = await petModel.getPetsByShelter(shelterId);

  successResponse(res, pets, 'Shelter pets retrieved successfully');
});

/**
 * Get featured pets
 */
const getFeaturedPets = asyncHandler(async (req, res) => {
  const limit = req.query.limit || 6;

  const pets = await petModel.getFeaturedPets(limit);

  successResponse(res, pets, 'Featured pets retrieved successfully');
});

module.exports = {
  createPet,
  getPets,
  searchPets,
  getPetById,
  getSimilarPets,
  updatePet,
  deletePet,
  getPetsByShelter,
  getFeaturedPets,
};
