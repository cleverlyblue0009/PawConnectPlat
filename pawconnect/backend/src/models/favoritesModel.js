const { PutCommand, DeleteCommand, ScanCommand, BatchGetCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient, TABLES } = require('../config/aws');

/**
 * Add pet to favorites
 */
const addFavorite = async (userId, petId) => {
  const favorite = {
    userId,
    petId,
    createdAt: Date.now(),
  };

  const command = new PutCommand({
    TableName: TABLES.FAVORITES,
    Item: favorite,
  });

  await docClient.send(command);
  return favorite;
};

/**
 * Remove pet from favorites
 */
const removeFavorite = async (userId, petId) => {
  const command = new DeleteCommand({
    TableName: TABLES.FAVORITES,
    Key: {
      userId,
      petId,
    },
  });

  await docClient.send(command);
  return true;
};

/**
 * Get all favorite pet IDs for a user
 */
const getUserFavorites = async (userId) => {
  const command = new ScanCommand({
    TableName: TABLES.FAVORITES,
    FilterExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
    },
  });

  const result = await docClient.send(command);
  const favorites = result.Items || [];

  // Sort by newest first
  favorites.sort((a, b) => b.createdAt - a.createdAt);
  
  // Return array of pet IDs
  return favorites.map(fav => fav.petId);
};

/**
 * Get detailed favorite pets for a user
 */
const getUserFavoritePets = async (userId) => {
  // First get favorite pet IDs
  const petIds = await getUserFavorites(userId);
  
  if (petIds.length === 0) {
    return [];
  }

  // Get full pet details
  const petPromises = petIds.map(async (petId) => {
    const command = new ScanCommand({
      TableName: TABLES.PETS,
      FilterExpression: 'petId = :petId',
      ExpressionAttributeValues: {
        ':petId': petId,
      },
    });
    
    const result = await docClient.send(command);
    return result.Items && result.Items.length > 0 ? result.Items[0] : null;
  });

  const pets = await Promise.all(petPromises);
  
  // Filter out any null results (deleted pets)
  return pets.filter(pet => pet !== null);
};

/**
 * Check if a pet is favorited by user
 */
const isFavorited = async (userId, petId) => {
  const command = new ScanCommand({
    TableName: TABLES.FAVORITES,
    FilterExpression: 'userId = :userId AND petId = :petId',
    ExpressionAttributeValues: {
      ':userId': userId,
      ':petId': petId,
    },
  });

  const result = await docClient.send(command);
  return result.Items && result.Items.length > 0;
};

/**
 * Get favorite count for a pet
 */
const getPetFavoriteCount = async (petId) => {
  const command = new ScanCommand({
    TableName: TABLES.FAVORITES,
    FilterExpression: 'petId = :petId',
    ExpressionAttributeValues: {
      ':petId': petId,
    },
  });

  const result = await docClient.send(command);
  return result.Items ? result.Items.length : 0;
};

module.exports = {
  addFavorite,
  removeFavorite,
  getUserFavorites,
  getUserFavoritePets,
  isFavorited,
  getPetFavoriteCount,
};
