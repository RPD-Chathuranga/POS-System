const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const logger = require('./utils/logger');
const User = require('./models/User');
const Product = require('./models/Product');
const Sale = require('./models/Sale');

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(hpp());
app.use(mongoSanitize());
app.use(xssClean());

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:5173', 'http://localhost:5175', 'http://localhost:3000'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    if (process.env.NODE_ENV !== 'production' && origin && /^(https?:\/\/localhost|https?:\/\/127\.0\.0\.1)/i.test(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api', apiLimiter);

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
  app.use((req, res, next) => {
    if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
      return next();
    }
    return res.redirect(`https://${req.headers.host}${req.originalUrl}`);
  });
}

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/sales', require('./routes/salesRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'POS System API is running', timestamp: new Date() });
});

// Error middleware
app.use(notFound);
app.use(errorHandler);

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

let server;

const shutdownServer = (signal) => {
  logger.info(`Received ${signal}. Closing server...`);
  if (server) {
    server.close(() => {
      logger.info('Server closed. Exiting process.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

const initializeDefaultUsers = async () => {
  const userCount = await User.countDocuments();
  if (userCount === 0 && process.env.NODE_ENV !== 'production') {
    await User.create({
      name: 'Admin User',
      email: 'admin@posystem.com',
      password: 'admin123',
      role: 'admin'
    });
    await User.create({
      name: 'John Cashier',
      email: 'cashier@posystem.com',
      password: 'cashier123',
      role: 'cashier'
    });
    console.log('✨ Default users created: admin@posystem.com / admin123 and cashier@posystem.com / cashier123');
  }
};

const initializeDefaultProducts = async () => {
  const productCount = await Product.countDocuments();
  if (productCount === 0 && process.env.NODE_ENV !== 'production') {
    const demoProducts = [
      { name: 'Coca-Cola 330ml', barcode: '5000112637922', price: 1.50, stock: 150, category: 'Beverages', unit: 'can', lowStockThreshold: 20 },
      { name: 'Pepsi 330ml', barcode: '4006381333931', price: 1.45, stock: 120, category: 'Beverages', unit: 'can', lowStockThreshold: 20 },
      { name: 'Mineral Water 500ml', barcode: '8901234567890', price: 0.80, stock: 200, category: 'Beverages', unit: 'bottle', lowStockThreshold: 30 },
      { name: 'Lays Classic Chips', barcode: '0028400090100', price: 2.50, stock: 80, category: 'Snacks', unit: 'pack', lowStockThreshold: 15 },
      { name: 'Oreo Cookies', barcode: '7622210100887', price: 3.20, stock: 60, category: 'Snacks', unit: 'pack', lowStockThreshold: 10 },
      { name: 'Maggi Noodles', barcode: '8901058882007', price: 1.80, stock: 100, category: 'Instant Food', unit: 'pack', lowStockThreshold: 20 },
      { name: 'Cadbury Dairy Milk', barcode: '7622210951168', price: 2.00, stock: 5, category: 'Confectionery', unit: 'bar', lowStockThreshold: 10 },
      { name: 'Pringles Original', barcode: '5053990109097', price: 4.50, stock: 40, category: 'Snacks', unit: 'can', lowStockThreshold: 8 },
      { name: 'Red Bull Energy Drink', barcode: '9002490100070', price: 3.50, stock: 3, category: 'Beverages', unit: 'can', lowStockThreshold: 12 },
      { name: 'Kit Kat Chocolate', barcode: '7613036898690', price: 1.70, stock: 75, category: 'Confectionery', unit: 'bar', lowStockThreshold: 15 },
      { name: 'Tropicana Orange Juice', barcode: '4011445070029', price: 4.20, stock: 0, category: 'Beverages', unit: 'bottle', lowStockThreshold: 10 },
      { name: 'Greek Yogurt', barcode: '5010069977965', price: 2.80, stock: 35, category: 'Dairy', unit: 'cup', lowStockThreshold: 8 },
      { name: 'Whole Wheat Bread', barcode: '0070617002817', price: 3.50, stock: 25, category: 'Bakery', unit: 'loaf', lowStockThreshold: 5 },
      { name: 'Butter Unsalted', barcode: '7310865004703', price: 4.00, stock: 20, category: 'Dairy', unit: 'pack', lowStockThreshold: 5 },
      { name: 'Nescafe Classic', barcode: '7613036840071', price: 8.90, stock: 30, category: 'Beverages', unit: 'jar', lowStockThreshold: 5 },
      { name: 'Sprite 330ml', barcode: '5449000000996', price: 1.55, stock: 140, category: 'Beverages', unit: 'can', lowStockThreshold: 25 },
      { name: 'Fanta Orange 330ml', barcode: '5449000000743', price: 1.45, stock: 130, category: 'Beverages', unit: 'can', lowStockThreshold: 20 },
      { name: 'Sunfeast Dark Fantasy', barcode: '8901129000679', price: 3.75, stock: 65, category: 'Snacks', unit: 'pack', lowStockThreshold: 10 },
      { name: 'Dove Beauty Bar', barcode: '8850128001255', price: 2.90, stock: 80, category: 'Personal Care', unit: 'bar', lowStockThreshold: 15 },
      { name: 'Colgate Total 100g', barcode: '070260591010', price: 2.10, stock: 95, category: 'Personal Care', unit: 'tube', lowStockThreshold: 10 },
      { name: 'Red Label Tea 250g', barcode: '8906006201208', price: 4.80, stock: 55, category: 'Groceries', unit: 'pack', lowStockThreshold: 10 }
    ];
    await Product.insertMany(demoProducts);
    console.log(`✨ Default products created: ${demoProducts.length} items`);
  }
};

const initializeDefaultSales = async () => {
  const saleCount = await Sale.countDocuments();
  if (saleCount >= 15 || process.env.NODE_ENV === 'production') return;

  const adminUser = await User.findOne({ email: 'admin@posystem.com' });
  const products = await Product.find({ isActive: true }).lean();

  if (!adminUser || products.length === 0) return;

  const availableProducts = products.filter(p => p.stock > 0);
  if (availableProducts.length === 0) return;

  const paymentMethods = ['cash', 'card', 'mobile'];
  const salesToCreate = [];
  const productStockAdjustments = {};
  const targetSales = 15 - saleCount;
  const salesDays = 7;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (salesDays - 1));
  startDate.setHours(9, 0, 0, 0);

  let receiptIndex = saleCount + 1;
  let attempts = 0;

  while (salesToCreate.length < targetSales && attempts < targetSales * 10) {
    attempts += 1;
    const saleDate = new Date(startDate);
    const dayOffset = salesToCreate.length % salesDays;
    saleDate.setDate(startDate.getDate() + dayOffset);
    saleDate.setMinutes(10 * (salesToCreate.length % 6));

    const itemsCount = 1 + Math.floor(Math.random() * 3);
    const chosenProducts = new Set();
    let subtotal = 0;
    const items = [];

    for (let j = 0; j < itemsCount; j += 1) {
      const candidates = availableProducts.filter(p => p.stock > 0 && !chosenProducts.has(String(p._id)));
      if (candidates.length === 0) break;

      const product = candidates[Math.floor(Math.random() * candidates.length)];
      chosenProducts.add(String(product._id));

      const maxQty = Math.min(3, product.stock);
      const quantity = 1 + Math.floor(Math.random() * maxQty);
      const itemSubtotal = parseFloat((product.price * quantity).toFixed(2));
      subtotal += itemSubtotal;

      items.push({
        product: product._id,
        productName: product.name,
        barcode: product.barcode,
        quantity,
        price: product.price,
        subtotal: itemSubtotal
      });

      product.stock -= quantity;
      productStockAdjustments[String(product._id)] = (productStockAdjustments[String(product._id)] || product.stock + quantity) - quantity;
    }

    if (items.length === 0) continue;

    const taxRate = [0, 5, 10][Math.floor(Math.random() * 3)];
    const discount = [0, 0, 1, 2][Math.floor(Math.random() * 4)];
    const tax = parseFloat(((subtotal - discount) * (taxRate / 100)).toFixed(2));
    const total = parseFloat((subtotal - discount + tax).toFixed(2));
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    const cashAmount = paymentMethod === 'cash' ? Math.ceil(total / 5) * 5 : total;
    const change = paymentMethod === 'cash' ? parseFloat((cashAmount - total).toFixed(2)) : 0;

    salesToCreate.push({
      receiptNumber: `RCP-${saleDate.getFullYear()}${String(saleDate.getMonth() + 1).padStart(2, '0')}${String(saleDate.getDate()).padStart(2, '0')}-${String(receiptIndex).padStart(4, '0')}`,
      items,
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax,
      taxRate,
      discount,
      total,
      paymentMethod,
      cashAmount,
      change,
      cashier: adminUser._id,
      cashierName: adminUser.name,
      status: 'completed',
      createdAt: new Date(saleDate.getTime() + salesToCreate.length * 600000),
      updatedAt: new Date(saleDate.getTime() + salesToCreate.length * 600000)
    });

    receiptIndex += 1;
  }

  if (salesToCreate.length > 0) {
    await Sale.insertMany(salesToCreate);
    console.log(`✨ Default sales history created: ${salesToCreate.length} records`);
  }

  for (const [productId, newStock] of Object.entries(productStockAdjustments)) {
    await Product.findByIdAndUpdate(productId, { stock: Math.max(newStock, 0) });
  }
};

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB connected successfully');
    await initializeDefaultUsers();
    await initializeDefaultProducts();
    await initializeDefaultSales();
    server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

process.on('SIGTERM', () => shutdownServer('SIGTERM'));
process.on('SIGINT', () => shutdownServer('SIGINT'));
process.once('SIGUSR2', () => {
  shutdownServer('SIGUSR2');
  process.kill(process.pid, 'SIGUSR2');
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
  shutdownServer('unhandledRejection');
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  shutdownServer('uncaughtException');
});

module.exports = app;
