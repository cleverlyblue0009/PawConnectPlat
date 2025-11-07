const { docClient, TABLES } = require('../config/aws');
const { ScanCommand } = require('@aws-sdk/lib-dynamodb');
const petModel = require('../models/petModel');
const { uploadMultipleToS3, deleteMultipleFromS3 } = require('../utils/s3Utils');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHandler');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Create a new pet listing
 */
const createPet = asyncHandler(async (req, res) => {
  // Use default shelter ID if no user authenticated
  const shelterId = req.user?.userId || 'default-shelter-001';

  console.log('Creating pet with shelterId:', shelterId);

  // Handle image uploads
  let imageUrls = [];
  if (req.files && req.files.length > 0) {
    console.log('Uploading', req.files.length, 'images...');
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

  console.log('Pet data:', petData);

  const pet = await petModel.createPet(petData);

  console.log('Pet created successfully:', pet.petId);

  successResponse(res, pet, 'Pet created successfully', 201);
});

/**
 * Get all pets with filters
 */
const getPets = asyncHandler(async (req, res) => {
  try {
    const {
      query,
      species,
      gender,
      minAge,
      maxAge,
      size,
      city,
      state,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      limit = 20,
      offset = 0,
    } = req.query;

    // Build filter expressions
    let filterExpressions = [];
    let expressionAttributeValues = {};
    let expressionAttributeNames = {};

    // Filter by species if provided
    if (species) {
      filterExpressions.push('species = :species');
      expressionAttributeValues[':species'] = species.toLowerCase();
    }

    // Filter by gender if provided
    if (gender && gender !== 'any') {
      filterExpressions.push('gender = :gender');
      expressionAttributeValues[':gender'] = gender.toLowerCase();
    }

    // Filter by age range if provided
    if (minAge || maxAge) {
      if (minAge) {
        filterExpressions.push('age >= :minAge');
        expressionAttributeValues[':minAge'] = parseInt(minAge) || 0;
      }
      if (maxAge) {
        filterExpressions.push('age <= :maxAge');
        expressionAttributeValues[':maxAge'] = parseInt(maxAge) || 100;
      }
    }

    // Filter by size/weight if provided
    if (size) {
      if (size === 'small') {
        filterExpressions.push('weight <= :sizeMax');
        expressionAttributeValues[':sizeMax'] = 25;
      } else if (size === 'medium') {
        filterExpressions.push('weight BETWEEN :sizeMin AND :sizeMax');
        expressionAttributeValues[':sizeMin'] = 26;
        expressionAttributeValues[':sizeMax'] = 60;
      } else if (size === 'large') {
        filterExpressions.push('weight BETWEEN :sizeMin AND :sizeMax');
        expressionAttributeValues[':sizeMin'] = 61;
        expressionAttributeValues[':sizeMax'] = 100;
      } else if (size === 'extra-large') {
        filterExpressions.push('weight > :sizeMin');
        expressionAttributeValues[':sizeMin'] = 100;
      }
    }

    // Filter by city if provided
    if (city) {
      filterExpressions.push('contains(#city, :city)');
      expressionAttributeValues[':city'] = city;
      expressionAttributeNames['#city'] = 'city';
    }

    // Filter by state if provided
    if (state) {
      filterExpressions.push('contains(#state, :state)');
      expressionAttributeValues[':state'] = state;
      expressionAttributeNames['#state'] = 'state';
    }

    // Filter by search query (name or breed)
    if (query) {
      filterExpressions.push('contains(#name, :query) OR contains(breed, :query)');
      expressionAttributeValues[':query'] = query;
      expressionAttributeNames['#name'] = 'name';
    }

    // Only show available pets
    filterExpressions.push('adoptionStatus = :status');
    expressionAttributeValues[':status'] = 'available';

    // Build the scan command
    const scanParams = {
      TableName: TABLES.PETS,
      Limit: 100, // Scan more to get better results after filtering
    };

    if (filterExpressions.length > 0) {
      scanParams.FilterExpression = filterExpressions.join(' AND ');
    }

    if (Object.keys(expressionAttributeValues).length > 0) {
      scanParams.ExpressionAttributeValues = expressionAttributeValues;
    }

    if (Object.keys(expressionAttributeNames).length > 0) {
      scanParams.ExpressionAttributeNames = expressionAttributeNames;
    }

    // Execute scan
    const command = new ScanCommand(scanParams);
    const result = await docClient.send(command);

    // Handle pagination with offset
    let allItems = result.Items || [];

    // Sort if needed
    if (sortBy === 'createdAt') {
      allItems.sort((a, b) => {
        const aVal = a.createdAt || 0;
        const bVal = b.createdAt || 0;
        return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
      });
    } else if (sortBy === 'name') {
      allItems.sort((a, b) => {
        const aVal = (a.name || '').toLowerCase();
        const bVal = (b.name || '').toLowerCase();
        return sortOrder === 'desc' ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
      });
    }

    const startIndex = parseInt(offset) || 0;
    const pageLimit = parseInt(limit) || 20;
    const endIndex = startIndex + pageLimit;
    const paginatedItems = allItems.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      pets: paginatedItems,
      total: allItems.length,
      limit: pageLimit,
      offset: startIndex,
      hasMore: endIndex < allItems.length,
      message: `Found ${paginatedItems.length} pets`,
    });
  } catch (error) {
    console.error('Error fetching pets:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pets',
      error: error.message,
    });
  }
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
  const shelterId = req.user?.userId || 'default-shelter-001';

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
  const shelterId = req.user?.userId || 'default-shelter-001';

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