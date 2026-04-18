const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

// ✅ include createUserByAdmin here
const { login, getMe, register, createUserByAdmin } = require('../controllers/authController');

const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validationMiddleware');

// ================= LOGIN =================
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validateRequest,
  login
);

// ================= REGISTER =================
router.post(
  '/register',
  optionalAuth,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['admin', 'cashier']).withMessage('Role must be admin or cashier')
  ],
  validateRequest,
  register
);

// ================= CREATE USER (ADMIN) =================
router.post(
  '/create-user',
  protect, // 🔒 only logged-in users
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('role').isIn(['admin', 'cashier']).withMessage('Role must be admin or cashier')
  ],
  validateRequest,
  createUserByAdmin
);

// ================= GET CURRENT USER =================
router.get('/me', protect, getMe);

module.exports = router;