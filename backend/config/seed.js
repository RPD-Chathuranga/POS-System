const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Product = require('../models/Product');
const Sale = require('../models/Sale');

const products = [
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

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Sale.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@posystem.com',
      password: 'admin123',
      role: 'admin'
    });

    const cashier = await User.create({
      name: 'John Cashier',
      email: 'cashier@posystem.com',
      password: 'cashier123',
      role: 'cashier'
    });

    console.log('👤 Users created:');
    console.log('   Admin: admin@posystem.com / admin123');
    console.log('   Cashier: cashier@posystem.com / cashier123');

    // Create products
    const createdProducts = await Product.insertMany(products);
    console.log(`📦 ${createdProducts.length} products created`);

    // Create some sample sales for the past 7 days
    const saleData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(10 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60));

      const numSales = Math.floor(Math.random() * 8) + 3;
      
      for (let j = 0; j < numSales; j++) {
        const saleDate = new Date(date);
        saleDate.setHours(date.getHours() + j, Math.floor(Math.random() * 60));

        const numItems = Math.floor(Math.random() * 4) + 1;
        const items = [];
        let subtotal = 0;

        for (let k = 0; k < numItems; k++) {
          const randomProduct = createdProducts[Math.floor(Math.random() * createdProducts.length)];
          const quantity = Math.floor(Math.random() * 3) + 1;
          const itemSubtotal = randomProduct.price * quantity;
          subtotal += itemSubtotal;

          items.push({
            product: randomProduct._id,
            productName: randomProduct.name,
            barcode: randomProduct.barcode,
            quantity,
            price: randomProduct.price,
            subtotal: itemSubtotal
          });
        }

        const paymentMethods = ['cash', 'card', 'cash', 'cash'];
        const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
        const cashAmount = paymentMethod === 'cash' ? Math.ceil(subtotal / 5) * 5 + 5 : subtotal;

        const count = saleData.length;
        const dateStr = `${saleDate.getFullYear()}${String(saleDate.getMonth()+1).padStart(2,'0')}${String(saleDate.getDate()).padStart(2,'0')}`;
        const receiptNumber = `RCP-${dateStr}-${String(count + 1).padStart(4, '0')}`;

        saleData.push({
          receiptNumber,
          items,
          subtotal,
          tax: 0,
          taxRate: 0,
          discount: 0,
          total: subtotal,
          paymentMethod,
          cashAmount,
          change: paymentMethod === 'cash' ? cashAmount - subtotal : 0,
          cashier: cashier._id,
          cashierName: cashier.name,
          status: 'completed',
          createdAt: saleDate,
          updatedAt: saleDate
        });
      }
    }

    await Sale.insertMany(saleData);
    console.log(`💰 ${saleData.length} sample sales created`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('🚀 You can now start the server with: npm run dev');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();
