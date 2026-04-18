const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  barcode: {
    type: String,
    required: [true, 'Barcode is required'],
    unique: true,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  stock: {
    type: Number,
    required: [true, 'Stock is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  category: {
    type: String,
    trim: true,
    default: 'General'
  },
  description: {
    type: String,
    trim: true
  },
  unit: {
    type: String,
    default: 'pcs'
  },
  lowStockThreshold: {
    type: Number,
    default: 10
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Virtual for low stock check
productSchema.virtual('isLowStock').get(function() {
  return this.stock <= this.lowStockThreshold;
});

productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
