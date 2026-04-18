const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: { type: String, required: true },
  barcode: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  subtotal: { type: Number, required: true }
});

const saleSchema = new mongoose.Schema({
  receiptNumber: {
    type: String,
    unique: true,
    required: true
  },
  items: [saleItemSchema],
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  taxRate: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'mobile'],
    default: 'cash'
  },
  cashAmount: { type: Number, default: 0 },
  change: { type: Number, default: 0 },
  cashier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cashierName: { type: String },
  status: {
    type: String,
    enum: ['completed', 'refunded', 'pending'],
    default: 'completed'
  },
  notes: { type: String }
}, { timestamps: true });

// Auto-generate receipt number
saleSchema.pre('save', async function(next) {
  if (!this.receiptNumber) {
    const count = await mongoose.model('Sale').countDocuments();
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}`;
    this.receiptNumber = `RCP-${dateStr}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Sale', saleSchema);
