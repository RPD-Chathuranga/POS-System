const express = require('express');
const { body, param, query } = require('express-validator');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validationMiddleware');
const { getUsers, getUser, createUser, updateUser, deactivateUser } = require('../controllers/userController');

const router = express.Router();

router.use(protect, adminOnly);

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
  ],
  validateRequest,
  getUsers
);

router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['admin', 'cashier']).withMessage('Role must be admin or cashier')
  ],
  validateRequest,
  createUser
);

router.get('/:id', [param('id').isMongoId()], validateRequest, getUser);

router.put(
  '/:id',
  [
    param('id').isMongoId(),
    body('name').optional().notEmpty(),
    body('email').optional().isEmail(),
    body('role').optional().isIn(['admin', 'cashier']),
    body('isActive').optional().isBoolean()
  ],
  validateRequest,
  updateUser
);

router.delete('/:id', [param('id').isMongoId()], validateRequest, deactivateUser);

module.exports = router;