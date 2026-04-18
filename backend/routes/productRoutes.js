const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();
const { 
  getProducts, getProductByBarcode, getProduct, 
  createProduct, updateProduct, deleteProduct, getLowStockProducts 
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validationMiddleware');

router.use(protect);

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('lowStock').optional().isBoolean().toBoolean()
  ],
  validateRequest,
  getProducts
);
router.get('/low-stock', getLowStockProducts);
router.get('/barcode/:barcode', [param('barcode').notEmpty().withMessage('Barcode is required')], validateRequest, getProductByBarcode);
router.post(
  '/',
  adminOnly,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('barcode').notEmpty().withMessage('Barcode is required'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than zero'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    body('category').notEmpty().withMessage('Category is required'),
    body('unit').notEmpty().withMessage('Unit is required'),
    body('lowStockThreshold').optional().isInt({ min: 0 }).withMessage('Low stock threshold must be a non-negative integer')
  ],
  validateRequest,
  createProduct
);
router.route('/:id')
  .get([param('id').isMongoId().withMessage('Valid product id is required')], validateRequest, getProduct)
  .put(
    adminOnly,
    [
      param('id').isMongoId().withMessage('Valid product id is required'),
      body('price').optional().isFloat({ gt: 0 }).withMessage('Price must be greater than zero'),
      body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
      body('lowStockThreshold').optional().isInt({ min: 0 }).withMessage('Low stock threshold must be a non-negative integer')
    ],
    validateRequest,
    updateProduct
  )
  .delete(adminOnly, [param('id').isMongoId().withMessage('Valid product id is required')], validateRequest, deleteProduct);

module.exports = router;
