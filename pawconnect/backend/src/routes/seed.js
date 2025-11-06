const express = require('express');
const router = express.Router();
const seedController = require('../controllers/seedController');
const { authenticate, isShelter } = require('../middleware/auth');

// Protected route - only authenticated shelters can seed data
router.post('/default-pets', authenticate, isShelter, seedController.seedDefaultPets);

module.exports = router;
