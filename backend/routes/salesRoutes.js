const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();
const { createSale, getSales, getSale, getSalesAnalytics } = require('../controllers/salesController');
const { protect } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validationMiddleware');

router.use(protect);

router.get(
  '/analytics',
  [query('period').optional().isInt({ min: 1, max: 30 }).toInt()],
  validateRequest,
  getSalesAnalytics
);
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('paymentMethod').optional().isIn(['cash', 'card', 'mobile'])
  ],
  validateRequest,
  getSales
);
router.post(
  '/',
  [
    body('items').isArray({ min: 1 }).withMessage('At least one sale item is required'),
    body('items.*.productId').isMongoId().withMessage('Valid product id is required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('paymentMethod').isIn(['cash', 'card', 'mobile']).withMessage('Valid payment method is required'),
    body('cashAmount').optional().isFloat({ min: 0 }),
    body('discount').optional().isFloat({ min: 0 }),
    body('taxRate').optional().isFloat({ min: 0 })
  ],
  validateRequest,
  createSale
);
router.get('/:id', [param('id').isMongoId().withMessage('Valid sale id is required')], validateRequest, getSale);

module.exports = router;
