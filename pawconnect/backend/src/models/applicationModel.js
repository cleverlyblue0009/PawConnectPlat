const { PutCommand, GetCommand, UpdateCommand, DeleteCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient, TABLES } = require('../config/aws');
const { v4: uuidv4 } = require('uuid');

/**
 * Create a new adoption application
 */
const createApplication = async (applicationData) => {
  const applicationId = uuidv4();

  const application = {
    applicationId,
    userId: applicationData.userId,
    petId: applicationData.petId,
    shelterId: applicationData.shelterId,
    status: 'submitted',
    
    personalInfo: {
      firstName: applicationData.personalInfo.firstName,
      lastName: applicationData.personalInfo.lastName,
      email: applicationData.personalInfo.email,
      phone: applicationData.personalInfo.phone,
      dateOfBirth: applicationData.personalInfo.dateOfBirth || '',
      address: applicationData.personalInfo.address || '',
      city: applicationData.personalInfo.city || '',
      state: applicationData.personalInfo.state || '',
      zip: applicationData.personalInfo.zip || '',
    },
    
    livingInfo: {
      livingType: applicationData.livingInfo.livingType,
      hasYard: applicationData.livingInfo.hasYard || false,
      householdMembers: applicationData.livingInfo.householdMembers,
      otherPets: applicationData.livingInfo.otherPets || [],
    },
    
    petExperience: {
      experienceLevel: applicationData.petExperience.experienceLevel,
      ownedPets: applicationData.petExperience.ownedPets || '',
      reason: applicationData.petExperience.reason || '',
    },
    
    references: applicationData.references || [],
    
    homeVisitRequired: applicationData.homeVisitRequired || false,
    homeVisitCompleted: false,
    homeVisitDate: null,
    approvalDate: null,
    rejectionReason: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const command = new PutCommand({
    TableName: TABLES.APPLICATIONS,
    Item: application,
  });

  await docClient.send(command);
  return application;
};

/**
 * Find application by ID
 */
const findById = async (applicationId) => {
  const command = new ScanCommand({
    TableName: TABLES.APPLICATIONS,
    FilterExpression: 'applicationId = :applicationId',
    ExpressionAttributeValues: {
      ':applicationId': applicationId,
    },
  });

  const result = await docClient.send(command);
  return result.Items && result.Items.length > 0 ? result.Items[0] : null;
};

/**
 * Get applications by user ID
 */
const getApplicationsByUser = async (userId) => {
  const command = new ScanCommand({
    TableName: TABLES.APPLICATIONS,
    FilterExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
    },
  });

  const result = await docClient.send(command);
  const applications = result.Items || [];

  // Sort by newest first
  applications.sort((a, b) => b.createdAt - a.createdAt);
  return applications;
};

/**
 * Get applications by pet ID
 */
const getApplicationsByPet = async (petId) => {
  const command = new ScanCommand({
    TableName: TABLES.APPLICATIONS,
    FilterExpression: 'petId = :petId',
    ExpressionAttributeValues: {
      ':petId': petId,
    },
  });

  const result = await docClient.send(command);
  const applications = result.Items || [];

  // Sort by newest first
  applications.sort((a, b) => b.createdAt - a.createdAt);
  return applications;
};

/**
 * Get applications by shelter ID
 */
const getApplicationsByShelter = async (shelterId) => {
  const command = new ScanCommand({
    TableName: TABLES.APPLICATIONS,
    FilterExpression: 'shelterId = :shelterId',
    ExpressionAttributeValues: {
      ':shelterId': shelterId,
    },
  });

  const result = await docClient.send(command);
  const applications = result.Items || [];

  // Sort by newest first
  applications.sort((a, b) => b.createdAt - a.createdAt);
  return applications;
};

/**
 * Update application
 */
const updateApplication = async (applicationId, updates) => {
  const application = await findById(applicationId);
  if (!application) {
    throw new Error('Application not found');
  }

  // Build update expression
  let updateExpression = 'SET updatedAt = :updatedAt';
  const expressionAttributeValues = {
    ':updatedAt': Date.now(),
  };

  // Handle status updates
  if (updates.status) {
    updateExpression += ', #status = :status';
    expressionAttributeValues[':status'] = updates.status;
    
    // Set approval date if approved
    if (updates.status === 'approved') {
      updateExpression += ', approvalDate = :approvalDate';
      expressionAttributeValues[':approvalDate'] = Date.now();
    }
  }

  // Handle rejection reason
  if (updates.rejectionReason) {
    updateExpression += ', rejectionReason = :rejectionReason';
    expressionAttributeValues[':rejectionReason'] = updates.rejectionReason;
  }

  // Handle home visit fields
  if (updates.homeVisitRequired !== undefined) {
    updateExpression += ', homeVisitRequired = :homeVisitRequired';
    expressionAttributeValues[':homeVisitRequired'] = updates.homeVisitRequired;
  }

  if (updates.homeVisitCompleted !== undefined) {
    updateExpression += ', homeVisitCompleted = :homeVisitCompleted';
    expressionAttributeValues[':homeVisitCompleted'] = updates.homeVisitCompleted;
  }

  if (updates.homeVisitDate) {
    updateExpression += ', homeVisitDate = :homeVisitDate';
    expressionAttributeValues[':homeVisitDate'] = updates.homeVisitDate;
  }

  const command = new UpdateCommand({
    TableName: TABLES.APPLICATIONS,
    Key: {
      applicationId: applicationId,
      createdAt: application.createdAt,
    },
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ...(updates.status && {
      ExpressionAttributeNames: {
        '#status': 'status',
      },
    }),
    ReturnValues: 'ALL_NEW',
  });

  const result = await docClient.send(command);
  return result.Attributes;
};

/**
 * Delete application
 */
const deleteApplication = async (applicationId) => {
  const application = await findById(applicationId);
  if (!application) {
    throw new Error('Application not found');
  }

  const command = new DeleteCommand({
    TableName: TABLES.APPLICATIONS,
    Key: {
      applicationId: applicationId,
      createdAt: application.createdAt,
    },
  });

  await docClient.send(command);
  return true;
};

/**
 * Check if user has already applied for a pet
 */
const hasUserApplied = async (userId, petId) => {
  const command = new ScanCommand({
    TableName: TABLES.APPLICATIONS,
    FilterExpression: 'userId = :userId AND petId = :petId',
    ExpressionAttributeValues: {
      ':userId': userId,
      ':petId': petId,
    },
  });

  const result = await docClient.send(command);
  return result.Items && result.Items.length > 0;
};

module.exports = {
  createApplication,
  findById,
  getApplicationsByUser,
  getApplicationsByPet,
  getApplicationsByShelter,
  updateApplication,
  deleteApplication,
  hasUserApplied,
};
