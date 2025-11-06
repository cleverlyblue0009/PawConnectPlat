const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { authenticate, isAdopter, isShelter } = require('../middleware/auth');
const { applicationValidation, uuidValidation, validate } = require('../utils/validation');

// Protected routes (adopter)
router.post(
  '/',
  authenticate,
  isAdopter,
  applicationValidation,
  validate,
  applicationController.createApplication
);

// Protected routes (any authenticated user)
router.get('/:applicationId', authenticate, uuidValidation('applicationId'), validate, applicationController.getApplicationById);
router.get('/user/:userId', authenticate, uuidValidation('userId'), validate, applicationController.getUserApplications);

// Protected routes (shelter only)
router.get('/pet/:petId', authenticate, isShelter, uuidValidation('petId'), validate, applicationController.getPetApplications);
router.get('/shelter/:shelterId', authenticate, isShelter, uuidValidation('shelterId'), validate, applicationController.getShelterApplications);

// Update routes
router.put('/:applicationId', authenticate, uuidValidation('applicationId'), validate, applicationController.updateApplication);
router.put('/:applicationId/status', authenticate, isShelter, uuidValidation('applicationId'), validate, applicationController.updateApplicationStatus);

// Delete route (adopter only)
router.delete('/:applicationId', authenticate, isAdopter, uuidValidation('applicationId'), validate, applicationController.deleteApplication);

module.exports = router;
