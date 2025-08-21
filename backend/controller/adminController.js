const User = require('../model/user');
const Product = require('../model/product');
const Order = require('../model/order');

const getStats = async (req, res) => {
  try {
    const [userCount, vendorCount, productCount, orderCount] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'vendor' }),
      Product.countDocuments(),
      Order.countDocuments(),
    ]);

    // total revenue from non-cancelled orders
    const revenueAgg = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const totalRevenue = (revenueAgg[0] && revenueAgg[0].total) ? revenueAgg[0].total : 0;

    // recent orders
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(10).select('user total status createdAt').populate('user', 'name email');

    // basic server stats
    const uptime = process.uptime();
    const memory = process.memoryUsage();

    res.json({
      counts: { users: userCount, vendors: vendorCount, products: productCount, orders: orderCount },
      totalRevenue,
      recentOrders,
      server: { uptime, memory }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error });
  }
};

module.exports = { getStats };
