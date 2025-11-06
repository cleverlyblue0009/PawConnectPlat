const { PutCommand, GetCommand, UpdateCommand, DeleteCommand, ScanCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient, TABLES } = require('../config/aws');
const { v4: uuidv4 } = require('uuid');

/**
 * Create a new pet listing
 */
const createPet = async (petData) => {
  const petId = uuidv4();

  const pet = {
    petId,
    shelterId: petData.shelterId,
    name: petData.name,
    breed: petData.breed,
    species: petData.species,
    age: petData.age,
    weight: petData.weight,
    gender: petData.gender,
    description: petData.description,
    shortDescription: petData.shortDescription || petData.description.substring(0, 150) + '...',
    images: petData.images || [],
    characteristics: petData.characteristics || [],
    city: petData.city,
    state: petData.state,
    adoptionStatus: 'available',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    adoptedBy: null,
  };

  const command = new PutCommand({
    TableName: TABLES.PETS,
    Item: pet,
  });

  await docClient.send(command);
  return pet;
};

/**
 * Find pet by ID
 */
const findById = async (petId) => {
  const command = new ScanCommand({
    TableName: TABLES.PETS,
    FilterExpression: 'petId = :petId',
    ExpressionAttributeValues: {
      ':petId': petId,
    },
  });

  const result = await docClient.send(command);
  return result.Items && result.Items.length > 0 ? result.Items[0] : null;
};

/**
 * Search pets with filters
 */
const searchPets = async (filters = {}) => {
  let filterExpression = '';
  const expressionAttributeValues = {};
  const expressionAttributeNames = {};
  const filterParts = [];

  // Always show only available pets by default unless specified
  if (!filters.status) {
    filterParts.push('adoptionStatus = :status');
    expressionAttributeValues[':status'] = 'available';
  }

  // Species filter
  if (filters.species) {
    filterParts.push('species = :species');
    expressionAttributeValues[':species'] = filters.species;
  }

  // Gender filter
  if (filters.gender) {
    filterParts.push('gender = :gender');
    expressionAttributeValues[':gender'] = filters.gender;
  }

  // Age filter
  if (filters.minAge !== undefined || filters.maxAge !== undefined) {
    if (filters.minAge !== undefined && filters.maxAge !== undefined) {
      filterParts.push('age BETWEEN :minAge AND :maxAge');
      expressionAttributeValues[':minAge'] = filters.minAge;
      expressionAttributeValues[':maxAge'] = filters.maxAge;
    } else if (filters.minAge !== undefined) {
      filterParts.push('age >= :minAge');
      expressionAttributeValues[':minAge'] = filters.minAge;
    } else {
      filterParts.push('age <= :maxAge');
      expressionAttributeValues[':maxAge'] = filters.maxAge;
    }
  }

  // City filter
  if (filters.city) {
    filterParts.push('city = :city');
    expressionAttributeValues[':city'] = filters.city;
  }

  // State filter
  if (filters.state) {
    filterParts.push('#state = :state');
    expressionAttributeNames['#state'] = 'state';
    expressionAttributeValues[':state'] = filters.state;
  }

  // Size filter (based on weight)
  if (filters.size) {
    const sizeRanges = {
      small: { max: 20 },
      medium: { min: 21, max: 50 },
      large: { min: 51, max: 100 },
      'extra-large': { min: 101 },
    };

    const range = sizeRanges[filters.size];
    if (range) {
      if (range.min && range.max) {
        filterParts.push('weight BETWEEN :minWeight AND :maxWeight');
        expressionAttributeValues[':minWeight'] = range.min;
        expressionAttributeValues[':maxWeight'] = range.max;
      } else if (range.min) {
        filterParts.push('weight >= :minWeight');
        expressionAttributeValues[':minWeight'] = range.min;
      } else if (range.max) {
        filterParts.push('weight <= :maxWeight');
        expressionAttributeValues[':maxWeight'] = range.max;
      }
    }
  }

  // Build filter expression
  if (filterParts.length > 0) {
    filterExpression = filterParts.join(' AND ');
  }

  const commandParams = {
    TableName: TABLES.PETS,
  };

  if (filterExpression) {
    commandParams.FilterExpression = filterExpression;
    commandParams.ExpressionAttributeValues = expressionAttributeValues;
    if (Object.keys(expressionAttributeNames).length > 0) {
      commandParams.ExpressionAttributeNames = expressionAttributeNames;
    }
  }

  const command = new ScanCommand(commandParams);
  const result = await docClient.send(command);

  let pets = result.Items || [];

  // Search by name or breed (client-side filtering)
  if (filters.query) {
    const query = filters.query.toLowerCase();
    pets = pets.filter(
      (pet) =>
        pet.name.toLowerCase().includes(query) ||
        pet.breed.toLowerCase().includes(query)
    );
  }

  // Sort
  const sortBy = filters.sortBy || 'createdAt';
  const sortOrder = filters.sortOrder || 'desc';
  
  pets.sort((a, b) => {
    if (sortOrder === 'desc') {
      return b[sortBy] - a[sortBy];
    }
    return a[sortBy] - b[sortBy];
  });

  // Pagination
  const limit = parseInt(filters.limit) || 20;
  const offset = parseInt(filters.offset) || 0;
  const total = pets.length;
  const paginatedPets = pets.slice(offset, offset + limit);

  return {
    pets: paginatedPets,
    total,
    hasMore: offset + paginatedPets.length < total,
  };
};

/**
 * Get pets by shelter ID
 */
const getPetsByShelter = async (shelterId) => {
  const command = new ScanCommand({
    TableName: TABLES.PETS,
    FilterExpression: 'shelterId = :shelterId',
    ExpressionAttributeValues: {
      ':shelterId': shelterId,
    },
  });

  const result = await docClient.send(command);
  return result.Items || [];
};

/**
 * Update pet
 */
const updatePet = async (petId, updates) => {
  const pet = await findById(petId);
  if (!pet) {
    throw new Error('Pet not found');
  }

  // Build update expression
  let updateExpression = 'SET updatedAt = :updatedAt';
  const expressionAttributeValues = {
    ':updatedAt': Date.now(),
  };
  const expressionAttributeNames = {};

  const allowedFields = [
    'name', 'breed', 'age', 'weight', 'gender',
    'description', 'shortDescription', 'images',
    'characteristics', 'city', 'state', 'adoptionStatus', 'adoptedBy'
  ];

  Object.keys(updates).forEach((key) => {
    if (allowedFields.includes(key) && updates[key] !== undefined) {
      if (key === 'state') {
        updateExpression += `, #state = :state`;
        expressionAttributeNames['#state'] = 'state';
        expressionAttributeValues[':state'] = updates[key];
      } else {
        updateExpression += `, ${key} = :${key}`;
        expressionAttributeValues[`:${key}`] = updates[key];
      }
    }
  });

  const command = new UpdateCommand({
    TableName: TABLES.PETS,
    Key: {
      petId: petId,
      shelterId: pet.shelterId,
    },
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ...(Object.keys(expressionAttributeNames).length > 0 && {
      ExpressionAttributeNames: expressionAttributeNames,
    }),
    ReturnValues: 'ALL_NEW',
  });

  const result = await docClient.send(command);
  return result.Attributes;
};

/**
 * Delete pet
 */
const deletePet = async (petId) => {
  const pet = await findById(petId);
  if (!pet) {
    throw new Error('Pet not found');
  }

  const command = new DeleteCommand({
    TableName: TABLES.PETS,
    Key: {
      petId: petId,
      shelterId: pet.shelterId,
    },
  });

  await docClient.send(command);
  return true;
};

/**
 * Get featured/newest pets
 */
const getFeaturedPets = async (limit = 6) => {
  const command = new ScanCommand({
    TableName: TABLES.PETS,
    FilterExpression: 'adoptionStatus = :status',
    ExpressionAttributeValues: {
      ':status': 'available',
    },
  });

  const result = await docClient.send(command);
  const pets = result.Items || [];

  // Sort by newest and return limited results
  pets.sort((a, b) => b.createdAt - a.createdAt);
  return pets.slice(0, limit);
};

/**
 * Get similar pets based on species, breed, and location
 */
const getSimilarPets = async (petId, limit = 3) => {
  const pet = await findById(petId);
  if (!pet) {
    return [];
  }

  const command = new ScanCommand({
    TableName: TABLES.PETS,
    FilterExpression: 'species = :species AND petId <> :petId AND adoptionStatus = :status',
    ExpressionAttributeValues: {
      ':species': pet.species,
      ':petId': petId,
      ':status': 'available',
    },
  });

  const result = await docClient.send(command);
  let pets = result.Items || [];

  // Prioritize same city/state
  pets.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    if (a.city === pet.city) scoreA += 2;
    if (a.state === pet.state) scoreA += 1;
    if (b.city === pet.city) scoreB += 2;
    if (b.state === pet.state) scoreB += 1;

    return scoreB - scoreA;
  });

  return pets.slice(0, limit);
};

module.exports = {
  createPet,
  findById,
  searchPets,
  getPetsByShelter,
  updatePet,
  deletePet,
  getFeaturedPets,
  getSimilarPets,
};
