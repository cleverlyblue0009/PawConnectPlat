const { body, param, query, validationResult } = require('express-validator');

/**
 * Validation middleware to check for errors
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};

/**
 * User registration validation rules
 */
const registerValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('userType')
    .isIn(['adopter', 'shelter'])
    .withMessage('User type must be adopter or shelter'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
];

/**
 * Login validation rules
 */
const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

/**
 * Pet creation validation rules
 */
const petValidation = [
  body('name').notEmpty().withMessage('Pet name is required'),
  body('breed').notEmpty().withMessage('Breed is required'),
  body('species')
    .isIn(['dog', 'cat', 'other'])
    .withMessage('Species must be dog, cat, or other'),
  body('age').isInt({ min: 0, max: 30 }).withMessage('Valid age is required'),
  body('weight').isFloat({ min: 0 }).withMessage('Valid weight is required'),
  body('gender')
    .isIn(['male', 'female'])
    .withMessage('Gender must be male or female'),
  body('description').notEmpty().withMessage('Description is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('state').notEmpty().withMessage('State is required'),
];

/**
 * Application validation rules
 */
const applicationValidation = [
  body('petId').notEmpty().withMessage('Pet ID is required'),
  body('personalInfo.firstName').notEmpty().withMessage('First name is required'),
  body('personalInfo.lastName').notEmpty().withMessage('Last name is required'),
  body('personalInfo.email').isEmail().withMessage('Valid email is required'),
  body('personalInfo.phone').notEmpty().withMessage('Phone is required'),
  body('livingInfo.livingType').notEmpty().withMessage('Living type is required'),
  body('livingInfo.householdMembers')
    .isInt({ min: 1 })
    .withMessage('Valid household members count required'),
  body('petExperience.experienceLevel')
    .isIn(['beginner', 'intermediate', 'experienced'])
    .withMessage('Valid experience level required'),
];

/**
 * UUID parameter validation
 */
const uuidValidation = (paramName) => [
  param(paramName).isUUID().withMessage(`Valid ${paramName} is required`),
];

/**
 * Query parameter validation for pet search
 */
const petSearchValidation = [
  query('species').optional().isIn(['dog', 'cat', 'other']),
  query('age').optional().isInt({ min: 0, max: 30 }),
  query('gender').optional().isIn(['male', 'female']),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  petValidation,
  applicationValidation,
  uuidValidation,
  petSearchValidation,
};
