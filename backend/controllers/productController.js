const Product = require('../models/Product');
const { createAudit } = require('../utils/audit');

// @desc    Get all products
// @route   GET /api/products
const getProducts = async (req, res) => {
  try {
    const { search, category, lowStock, page = 1, limit = 50 } = req.query;
    
    let query = { isActive: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) query.category = category;
    if (lowStock === 'true') {
      query.$expr = { $lte: ['$stock', '$lowStockThreshold'] };
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get product by barcode
// @route   GET /api/products/barcode/:barcode
const getProductByBarcode = async (req, res) => {
  try {
    const product = await Product.findOne({ 
      barcode: req.params.barcode, 
      isActive: true 
    });
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found with this barcode' });
    }

    if (product.stock <= 0) {
      return res.status(400).json({ success: false, message: 'Product is out of stock', product });
    }

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
const getProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, isActive: true });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create product
// @route   POST /api/products
const createProduct = async (req, res) => {
  try {
    const { name, barcode, price, stock, category, description, unit, lowStockThreshold } = req.body;

    const existingProduct = await Product.findOne({ barcode });
    if (existingProduct) {
      return res.status(400).json({ success: false, message: 'Product with this barcode already exists' });
    }

    const product = await Product.create({
      name, barcode, price, stock, category, description, unit, lowStockThreshold
    });

    await createAudit({
      action: 'create',
      resource: 'product',
      resourceId: product._id,
      user: req.user,
      details: { name, barcode, price, stock, category }
    });

    res.status(201).json({ success: true, product, message: 'Product created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check barcode uniqueness if changed
    if (req.body.barcode && req.body.barcode !== product.barcode) {
      const existing = await Product.findOne({ barcode: req.body.barcode });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Barcode already in use' });
      }
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { 
      new: true, 
      runValidators: true 
    });

    await createAudit({
      action: 'update',
      resource: 'product',
      resourceId: updated._id,
      user: req.user,
      details: req.body
    });

    res.json({ success: true, product: updated, message: 'Product updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete product (soft delete)
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.isActive = false;
    await product.save();

    await createAudit({
      action: 'deactivate',
      resource: 'product',
      resourceId: product._id,
      user: req.user,
      details: { name: product.name, barcode: product.barcode }
    });

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get low stock products
// @route   GET /api/products/low-stock
const getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
      $expr: { $lte: ['$stock', '$lowStockThreshold'] }
    }).sort({ stock: 1 });

    res.json({ success: true, products, count: products.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { 
  getProducts, getProductByBarcode, getProduct, 
  createProduct, updateProduct, deleteProduct, getLowStockProducts 
};
