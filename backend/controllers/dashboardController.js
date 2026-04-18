const Sale = require('../models/Sale');
const Product = require('../models/Product');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Today's stats
    const todaySales = await Sale.aggregate([
      { $match: { createdAt: { $gte: today, $lte: todayEnd }, status: 'completed' } },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$total' },
          transactions: { $sum: 1 },
          itemsSold: { $sum: { $size: '$items' } }
        }
      }
    ]);

    // Yesterday's stats for comparison
    const yesterdaySales = await Sale.aggregate([
      { $match: { createdAt: { $gte: yesterday, $lt: today }, status: 'completed' } },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$total' },
          transactions: { $sum: 1 }
        }
      }
    ]);

    // This week's revenue
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    const weekSales = await Sale.aggregate([
      { $match: { createdAt: { $gte: weekStart }, status: 'completed' } },
      { $group: { _id: null, revenue: { $sum: '$total' }, transactions: { $sum: 1 } } }
    ]);

    // This month's revenue
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthSales = await Sale.aggregate([
      { $match: { createdAt: { $gte: monthStart }, status: 'completed' } },
      { $group: { _id: null, revenue: { $sum: '$total' }, transactions: { $sum: 1 } } }
    ]);

    // Total products & low stock
    const totalProducts = await Product.countDocuments({ isActive: true });
    const lowStockProducts = await Product.find({
      isActive: true,
      $expr: { $lte: ['$stock', '$lowStockThreshold'] }
    }).select('name stock lowStockThreshold').sort({ stock: 1 }).limit(5);

    const outOfStock = await Product.countDocuments({ isActive: true, stock: 0 });

    // Recent transactions
    const recentSales = await Sale.find({ status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('receiptNumber total paymentMethod createdAt cashierName items');

    const todayData = todaySales[0] || { revenue: 0, transactions: 0, itemsSold: 0 };
    const yesterdayData = yesterdaySales[0] || { revenue: 0, transactions: 0 };

    const revenueChange = yesterdayData.revenue > 0 
      ? ((todayData.revenue - yesterdayData.revenue) / yesterdayData.revenue * 100).toFixed(1)
      : 0;

    res.json({
      success: true,
      stats: {
        today: {
          revenue: todayData.revenue,
          transactions: todayData.transactions,
          itemsSold: todayData.itemsSold,
          revenueChange: parseFloat(revenueChange)
        },
        week: {
          revenue: weekSales[0]?.revenue || 0,
          transactions: weekSales[0]?.transactions || 0
        },
        month: {
          revenue: monthSales[0]?.revenue || 0,
          transactions: monthSales[0]?.transactions || 0
        },
        inventory: {
          totalProducts,
          lowStockCount: lowStockProducts.length,
          outOfStock,
          lowStockItems: lowStockProducts
        },
        recentSales
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboardStats };
