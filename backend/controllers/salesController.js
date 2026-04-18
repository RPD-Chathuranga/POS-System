const Sale = require('../models/Sale');
const Product = require('../models/Product');
const mongoose = require('mongoose');
const { createAudit } = require('../utils/audit');

// @desc    Create a new sale
// @route   POST /api/sales
const createSale = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, paymentMethod, cashAmount, discount, taxRate, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in sale' });
    }

    // Verify stock and calculate totals
    let subtotal = 0;
    const saleItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      
      if (!product || !product.isActive) {
        await session.abortTransaction();
        return res.status(404).json({ 
          success: false, 
          message: `Product "${item.productName}" not found` 
        });
      }

      if (product.stock < item.quantity) {
        await session.abortTransaction();
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}` 
        });
      }

      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;

      saleItems.push({
        product: product._id,
        productName: product.name,
        barcode: product.barcode,
        quantity: item.quantity,
        price: product.price,
        subtotal: itemSubtotal
      });

      // Deduct stock
      product.stock -= item.quantity;
      await product.save({ session });
    }

    const discountAmount = discount || 0;
    const taxAmount = taxRate ? (subtotal - discountAmount) * (taxRate / 100) : 0;
    const total = subtotal - discountAmount + taxAmount;
    const change = paymentMethod === 'cash' ? (cashAmount || 0) - total : 0;

    // Generate receipt number
    const count = await Sale.countDocuments().session(session);
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}`;
    const receiptNumber = `RCP-${dateStr}-${String(count + 1).padStart(4, '0')}`;

    const sale = await Sale.create([{
      receiptNumber,
      items: saleItems,
      subtotal,
      tax: taxAmount,
      taxRate: taxRate || 0,
      discount: discountAmount,
      total,
      paymentMethod: paymentMethod || 'cash',
      cashAmount: paymentMethod === 'cash' ? cashAmount : total,
      change: change < 0 ? 0 : change,
      cashier: req.user?._id,
      cashierName: req.user?.name || 'Cashier',
      notes
    }], { session });

    await session.commitTransaction();

    const populatedSale = await Sale.findById(sale[0]._id).populate('cashier', 'name');

    await createAudit({
      action: 'create',
      resource: 'sale',
      resourceId: sale[0]._id,
      user: req.user,
      details: {
        receiptNumber,
        paymentMethod,
        total,
        items: saleItems.map(item => ({ product: item.productName, quantity: item.quantity, price: item.price }))
      },
      req
    });

    res.status(201).json({ 
      success: true, 
      sale: populatedSale, 
      message: 'Sale completed successfully' 
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

// @desc    Get all sales
// @route   GET /api/sales
const getSales = async (req, res) => {
  try {
    const { page = 1, limit = 20, startDate, endDate, paymentMethod } = req.query;
    
    let query = {};
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }
    
    if (paymentMethod) query.paymentMethod = paymentMethod;

    const total = await Sale.countDocuments(query);
    const sales = await Sale.find(query)
      .populate('cashier', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      sales,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single sale
// @route   GET /api/sales/:id
const getSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id).populate('cashier', 'name email');
    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale not found' });
    }
    res.json({ success: true, sale });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get sales analytics
// @route   GET /api/sales/analytics
const getSalesAnalytics = async (req, res) => {
  try {
    const { period = '7' } = req.query;
    const days = parseInt(period);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const salesByDay = await Sale.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: 'completed' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          revenue: { $sum: '$total' },
          transactions: { $sum: 1 },
          items: { $sum: { $size: '$items' } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    const paymentBreakdown = await Sale.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: 'completed' } },
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$total' },
          count: { $sum: 1 }
        }
      }
    ]);

    const topProducts = await Sale.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: 'completed' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.productName' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 }
    ]);

    res.json({ 
      success: true, 
      salesByDay,
      paymentBreakdown,
      topProducts
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createSale, getSales, getSale, getSalesAnalytics };
