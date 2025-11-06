const applicationModel = require('../models/applicationModel');
const petModel = require('../models/petModel');
const userModel = require('../models/userModel');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Create a new adoption application
 */
const createApplication = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { petId } = req.body;

  // Check if pet exists
  const pet = await petModel.findById(petId);
  if (!pet) {
    return errorResponse(res, 'Pet not found', 404);
  }

  // Check if pet is available
  if (pet.adoptionStatus !== 'available') {
    return errorResponse(res, 'Pet is not available for adoption', 400);
  }

  // Check if user already applied for this pet
  const hasApplied = await applicationModel.hasUserApplied(userId, petId);
  if (hasApplied) {
    return errorResponse(res, 'You have already applied for this pet', 400);
  }

  const applicationData = {
    userId,
    petId,
    shelterId: pet.shelterId,
    personalInfo: req.body.personalInfo,
    livingInfo: req.body.livingInfo,
    petExperience: req.body.petExperience,
    references: req.body.references || [],
    homeVisitRequired: req.body.homeVisitRequired || false,
  };

  const application = await applicationModel.createApplication(applicationData);

  // Update pet status to pending
  await petModel.updatePet(petId, { adoptionStatus: 'pending' });

  successResponse(res, application, 'Application submitted successfully', 201);
});

/**
 * Get application by ID
 */
const getApplicationById = asyncHandler(async (req, res) => {
  const { applicationId } = req.params;
  const userId = req.user.userId;
  const userType = req.user.userType;

  const application = await applicationModel.findById(applicationId);

  if (!application) {
    return errorResponse(res, 'Application not found', 404);
  }

  // Check authorization - user can only view their own applications unless they're a shelter
  if (userType === 'adopter' && application.userId !== userId) {
    return errorResponse(res, 'Unauthorized to view this application', 403);
  }

  if (userType === 'shelter' && application.shelterId !== userId) {
    return errorResponse(res, 'Unauthorized to view this application', 403);
  }

  // Get pet and user details
  const pet = await petModel.findById(application.petId);
  const applicant = await userModel.findById(application.userId);

  const responseData = {
    ...application,
    pet,
    applicant: {
      userId: applicant.userId,
      firstName: applicant.firstName,
      lastName: applicant.lastName,
      email: applicant.email,
      phone: applicant.phone,
    },
  };

  successResponse(res, responseData, 'Application retrieved successfully');
});

/**
 * Get applications by user
 */
const getUserApplications = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Check authorization
  if (req.user.userId !== userId && req.user.userType !== 'shelter') {
    return errorResponse(res, 'Unauthorized', 403);
  }

  const applications = await applicationModel.getApplicationsByUser(userId);

  // Get pet details for each application
  const applicationsWithPets = await Promise.all(
    applications.map(async (app) => {
      const pet = await petModel.findById(app.petId);
      return { ...app, pet };
    })
  );

  successResponse(res, applicationsWithPets, 'User applications retrieved successfully');
});

/**
 * Get applications by pet
 */
const getPetApplications = asyncHandler(async (req, res) => {
  const { petId } = req.params;

  // Check if pet exists
  const pet = await petModel.findById(petId);
  if (!pet) {
    return errorResponse(res, 'Pet not found', 404);
  }

  // Check authorization - only shelter that owns the pet can view
  if (req.user.userType !== 'shelter' || pet.shelterId !== req.user.userId) {
    return errorResponse(res, 'Unauthorized', 403);
  }

  const applications = await applicationModel.getApplicationsByPet(petId);

  // Get applicant details for each application
  const applicationsWithUsers = await Promise.all(
    applications.map(async (app) => {
      const applicant = await userModel.findById(app.userId);
      return {
        ...app,
        applicant: {
          userId: applicant.userId,
          firstName: applicant.firstName,
          lastName: applicant.lastName,
          email: applicant.email,
          phone: applicant.phone,
        },
      };
    })
  );

  successResponse(res, applicationsWithUsers, 'Pet applications retrieved successfully');
});

/**
 * Get applications by shelter
 */
const getShelterApplications = asyncHandler(async (req, res) => {
  const { shelterId } = req.params;

  // Check authorization
  if (req.user.userType !== 'shelter' || req.user.userId !== shelterId) {
    return errorResponse(res, 'Unauthorized', 403);
  }

  const applications = await applicationModel.getApplicationsByShelter(shelterId);

  // Get pet and applicant details
  const applicationsWithDetails = await Promise.all(
    applications.map(async (app) => {
      const pet = await petModel.findById(app.petId);
      const applicant = await userModel.findById(app.userId);
      return {
        ...app,
        pet,
        applicant: {
          userId: applicant.userId,
          firstName: applicant.firstName,
          lastName: applicant.lastName,
          email: applicant.email,
          phone: applicant.phone,
        },
      };
    })
  );

  successResponse(res, applicationsWithDetails, 'Shelter applications retrieved successfully');
});

/**
 * Update application
 */
const updateApplication = asyncHandler(async (req, res) => {
  const { applicationId } = req.params;

  const application = await applicationModel.findById(applicationId);

  if (!application) {
    return errorResponse(res, 'Application not found', 404);
  }

  // Only user who created or shelter can update
  if (
    req.user.userId !== application.userId &&
    (req.user.userType !== 'shelter' || req.user.userId !== application.shelterId)
  ) {
    return errorResponse(res, 'Unauthorized', 403);
  }

  const updatedApplication = await applicationModel.updateApplication(applicationId, req.body);

  successResponse(res, updatedApplication, 'Application updated successfully');
});

/**
 * Update application status (shelter only)
 */
const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { applicationId } = req.params;
  const { status, rejectionReason } = req.body;

  const application = await applicationModel.findById(applicationId);

  if (!application) {
    return errorResponse(res, 'Application not found', 404);
  }

  // Only shelter can update status
  if (req.user.userType !== 'shelter' || req.user.userId !== application.shelterId) {
    return errorResponse(res, 'Unauthorized', 403);
  }

  const updates = { status };
  if (rejectionReason) {
    updates.rejectionReason = rejectionReason;
  }

  const updatedApplication = await applicationModel.updateApplication(applicationId, updates);

  // Update pet status based on application status
  if (status === 'approved') {
    await petModel.updatePet(application.petId, {
      adoptionStatus: 'adopted',
      adoptedBy: application.userId,
    });
  } else if (status === 'rejected') {
    // Check if there are other pending applications
    const petApplications = await applicationModel.getApplicationsByPet(application.petId);
    const hasPendingApps = petApplications.some(
      (app) => app.applicationId !== applicationId && app.status === 'submitted'
    );

    // Only set back to available if no other pending applications
    if (!hasPendingApps) {
      await petModel.updatePet(application.petId, { adoptionStatus: 'available' });
    }
  }

  successResponse(res, updatedApplication, 'Application status updated successfully');
});

/**
 * Delete application
 */
const deleteApplication = asyncHandler(async (req, res) => {
  const { applicationId } = req.params;

  const application = await applicationModel.findById(applicationId);

  if (!application) {
    return errorResponse(res, 'Application not found', 404);
  }

  // Only user who created can delete (before review)
  if (req.user.userId !== application.userId) {
    return errorResponse(res, 'Unauthorized', 403);
  }

  // Can only delete if still in submitted status
  if (application.status !== 'submitted') {
    return errorResponse(res, 'Cannot delete application that is under review or completed', 400);
  }

  await applicationModel.deleteApplication(applicationId);

  // Check if there are other applications for this pet
  const petApplications = await applicationModel.getApplicationsByPet(application.petId);
  if (petApplications.length === 0) {
    // No other applications, set pet back to available
    await petModel.updatePet(application.petId, { adoptionStatus: 'available' });
  }

  successResponse(res, null, 'Application deleted successfully');
});

module.exports = {
  createApplication,
  getApplicationById,
  getUserApplications,
  getPetApplications,
  getShelterApplications,
  updateApplication,
  updateApplicationStatus,
  deleteApplication,
};
