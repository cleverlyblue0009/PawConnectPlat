const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { uploadSingle, handleUploadError } = require('../middleware/upload');
const { uuidValidation, validate } = require('../utils/validation');

// Protected routes
router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, uploadSingle, handleUploadError, userController.updateProfile);

// Favorites routes
router.post('/favorites/:petId', authenticate, uuidValidation('petId'), validate, userController.addFavorite);
router.delete('/favorites/:petId', authenticate, uuidValidation('petId'), validate, userController.removeFavorite);
router.get('/favorites', authenticate, userController.getFavorites);
router.get('/favorites/pets', authenticate, userController.getFavoritePets);

// Public route for viewing user profiles
router.get('/:userId', uuidValidation('userId'), validate, userController.getUserById);

module.exports = router;
