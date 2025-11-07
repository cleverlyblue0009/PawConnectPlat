const express = require('express');
const router = express.Router();
const petController = require('../controllers/petController');
const { authenticate, isShelter, optionalAuth } = require('../middleware/auth');
const { uploadMultiple, handleUploadError } = require('../middleware/upload');
const { petValidation, uuidValidation, petSearchValidation, validate } = require('../utils/validation');

// Public routes
router.get('/', petSearchValidation, validate, petController.getPets);
router.get('/search', petController.searchPets);
router.get('/featured', petController.getFeaturedPets);
router.get('/by-shelter/:shelterId', uuidValidation('shelterId'), validate, petController.getPetsByShelter);
router.get('/:petId', uuidValidation('petId'), validate, petController.getPetById);
router.get('/:petId/similar', uuidValidation('petId'), validate, petController.getSimilarPets);

// Create pet (NO AUTH REQUIRED for testing)
router.post(
  '/',
  uploadMultiple,
  handleUploadError,
  petController.createPet
);

// Protected routes (shelter only)
router.put(
  '/:petId',
  authenticate,
  isShelter,
  uuidValidation('petId'),
  validate,
  uploadMultiple,
  handleUploadError,
  petController.updatePet
);

router.delete(
  '/:petId',
  authenticate,
  isShelter,
  uuidValidation('petId'),
  validate,
  petController.deletePet
);

module.exports = router;