const { PutCommand, GetCommand, UpdateCommand, DeleteCommand, QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient, TABLES } = require('../config/aws');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

/**
 * Create a new user
 */
const createUser = async (userData) => {
  const userId = uuidv4();
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  const user = {
    userId,
    userType: userData.userType,
    email: userData.email.toLowerCase(),
    password: hashedPassword,
    firstName: userData.firstName,
    lastName: userData.lastName,
    phone: userData.phone || '',
    dateOfBirth: userData.dateOfBirth || '',
    address: userData.address || '',
    city: userData.city || '',
    state: userData.state || '',
    zip: userData.zip || '',
    profileImage: userData.profileImage || '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  // Add adopter-specific fields
  if (userData.userType === 'adopter') {
    user.livingType = userData.livingType || '';
    user.hasYard = userData.hasYard || false;
    user.householdMembers = userData.householdMembers || 1;
  }

  // Add shelter-specific fields
  if (userData.userType === 'shelter') {
    user.shelterName = userData.shelterName || '';
    user.shelterDescription = userData.shelterDescription || '';
    user.website = userData.website || '';
    user.verified = false;
  }

  const command = new PutCommand({
    TableName: TABLES.USERS,
    Item: user,
  });

  await docClient.send(command);

  // Remove password from returned object
  delete user.password;
  return user;
};

/**
 * Find user by email
 */
const findByEmail = async (email) => {
  const command = new ScanCommand({
    TableName: TABLES.USERS,
    FilterExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': email.toLowerCase(),
    },
  });

  const result = await docClient.send(command);
  return result.Items && result.Items.length > 0 ? result.Items[0] : null;
};

/**
 * Find user by ID
 */
const findById = async (userId) => {
  const command = new ScanCommand({
    TableName: TABLES.USERS,
    FilterExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
    },
  });

  const result = await docClient.send(command);
  
  if (result.Items && result.Items.length > 0) {
    const user = result.Items[0];
    delete user.password;
    return user;
  }
  
  return null;
};

/**
 * Update user profile
 */
const updateUser = async (userId, updates) => {
  // Build update expression
  let updateExpression = 'SET updatedAt = :updatedAt';
  const expressionAttributeValues = {
    ':updatedAt': Date.now(),
  };
  const expressionAttributeNames = {};

  const allowedFields = [
    'firstName', 'lastName', 'phone', 'dateOfBirth',
    'address', 'city', 'state', 'zip', 'profileImage',
    'livingType', 'hasYard', 'householdMembers',
    'shelterName', 'shelterDescription', 'website'
  ];

  Object.keys(updates).forEach((key) => {
    if (allowedFields.includes(key) && updates[key] !== undefined) {
      updateExpression += `, #${key} = :${key}`;
      expressionAttributeNames[`#${key}`] = key;
      expressionAttributeValues[`:${key}`] = updates[key];
    }
  });

  // First, get the user to find their sort key
  const user = await findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const command = new UpdateCommand({
    TableName: TABLES.USERS,
    Key: {
      userId: userId,
      userType: user.userType,
    },
    UpdateExpression: updateExpression,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW',
  });

  const result = await docClient.send(command);
  const updatedUser = result.Attributes;
  delete updatedUser.password;
  return updatedUser;
};

/**
 * Delete user
 */
const deleteUser = async (userId) => {
  const user = await findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const command = new DeleteCommand({
    TableName: TABLES.USERS,
    Key: {
      userId: userId,
      userType: user.userType,
    },
  });

  await docClient.send(command);
  return true;
};

/**
 * Verify user password
 */
const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

/**
 * Get all shelters
 */
const getAllShelters = async () => {
  const command = new ScanCommand({
    TableName: TABLES.USERS,
    FilterExpression: 'userType = :userType',
    ExpressionAttributeValues: {
      ':userType': 'shelter',
    },
  });

  const result = await docClient.send(command);
  
  // Remove passwords from all results
  if (result.Items) {
    result.Items.forEach(shelter => delete shelter.password);
  }
  
  return result.Items || [];
};

module.exports = {
  createUser,
  findByEmail,
  findById,
  updateUser,
  deleteUser,
  verifyPassword,
  getAllShelters,
};
