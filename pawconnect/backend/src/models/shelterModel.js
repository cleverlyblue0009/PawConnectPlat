const userModel = require('./userModel');
const petModel = require('./petModel');

/**
 * Get shelter details with their pets
 */
const getShelterWithPets = async (shelterId) => {
  const shelter = await userModel.findById(shelterId);
  
  if (!shelter || shelter.userType !== 'shelter') {
    throw new Error('Shelter not found');
  }

  const pets = await petModel.getPetsByShelter(shelterId);

  return {
    ...shelter,
    pets,
    petCount: pets.length,
    availablePets: pets.filter(pet => pet.adoptionStatus === 'available').length,
  };
};

/**
 * Get all shelters with basic info
 */
const getAllShelters = async () => {
  const shelters = await userModel.getAllShelters();

  // Add pet counts for each shelter
  const sheltersWithCounts = await Promise.all(
    shelters.map(async (shelter) => {
      const pets = await petModel.getPetsByShelter(shelter.userId);
      return {
        ...shelter,
        petCount: pets.length,
        availablePets: pets.filter(pet => pet.adoptionStatus === 'available').length,
      };
    })
  );

  return sheltersWithCounts;
};

/**
 * Update shelter information
 */
const updateShelter = async (shelterId, updates) => {
  const shelter = await userModel.findById(shelterId);
  
  if (!shelter || shelter.userType !== 'shelter') {
    throw new Error('Shelter not found');
  }

  return await userModel.updateUser(shelterId, updates);
};

/**
 * Get shelter statistics
 */
const getShelterStats = async (shelterId) => {
  const pets = await petModel.getPetsByShelter(shelterId);
  
  const stats = {
    totalPets: pets.length,
    available: pets.filter(p => p.adoptionStatus === 'available').length,
    pending: pets.filter(p => p.adoptionStatus === 'pending').length,
    adopted: pets.filter(p => p.adoptionStatus === 'adopted').length,
    dogs: pets.filter(p => p.species === 'dog').length,
    cats: pets.filter(p => p.species === 'cat').length,
    others: pets.filter(p => p.species === 'other').length,
  };

  return stats;
};

module.exports = {
  getShelterWithPets,
  getAllShelters,
  updateShelter,
  getShelterStats,
};
