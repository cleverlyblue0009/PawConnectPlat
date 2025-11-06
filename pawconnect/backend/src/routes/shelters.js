const express = require('express');
const router = express.Router();
const shelterController = require('../controllers/shelterController');
const { authenticate, isShelter } = require('../middleware/auth');
const { uuidValidation, validate } = require('../utils/validation');

// Public routes
router.get('/', shelterController.getAllShelters);
router.get('/:shelterId', uuidValidation('shelterId'), validate, shelterController.getShelterById);

// Protected routes (shelter only)
router.put('/:shelterId', authenticate, isShelter, uuidValidation('shelterId'), validate, shelterController.updateShelter);
router.get('/:shelterId/stats', authenticate, isShelter, uuidValidation('shelterId'), validate, shelterController.getShelterStats);

module.exports = router;
