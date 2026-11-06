import Book from '../models/Book.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Category from '../models/Category.js';

export const getDashboardStats = async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'user', isActive: true });
    const totalOrders = await Order.countDocuments();
    const salesResult = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, totalSales: { $sum: '$totalAmount' } } },
    ]);
    const totalSales = salesResult[0]?.totalSales || 0;
    const lowStockBooks = await Book.find({ stock: { $lte: 5 } }).sort({ stock: 1 }).limit(10);

    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email');

    res.json({
      totalBooks,
      totalCategories,
      totalCustomers,
      totalOrders,
      totalSales,
      lowStockBooks,
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({ message: 'Dashboard statistics failed', error: error.message });
  }
};

export const getCustomers = async (req, res) => {
  try {
    const { search = '', active } = req.query;
    const query = { role: 'user' };

    if (search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { phone: { $regex: search.trim(), $options: 'i' } },
      ];
    }
    if (active === 'true' || active === 'false') {
      query.isActive = active === 'true';
    }

    const customers = await User.find(query).select('-passwordHash').sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch customers', error: error.message });
  }
};

export const getCustomerDetails = async (req, res) => {
  try {
    const customer = await User.findOne({ _id: req.params.id, role: 'user' }).select('-passwordHash');
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const orders = await Order.find({ user: customer._id }).sort({ createdAt: -1 });
    res.json({ customer, orders });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch customer details', error: error.message });
  }
};

export const setCustomerActive = async (req, res) => {
  try {
    if (typeof req.body.isActive !== 'boolean') {
      return res.status(400).json({ message: 'isActive must be a boolean' });
    }

    const customer = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'user' },
      { isActive: req.body.isActive },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update customer account', error: error.message });
  }
};

export const getSalesReport = async (req, res) => {
  try {
    const report = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          sales: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate sales report', error: error.message });
  }
};

export const getBestSellingBooks = async (req, res) => {
  try {
    const result = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.book',
          title: { $first: '$items.title' },
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bestseller data', error: error.message });
  }
};

export const getInventoryReport = async (req, res) => {
  try {
    const lowStock = await Book.find({ stock: { $lte: 10 } }).sort({ stock: 1 });
    const totalInventoryValue = await Book.aggregate([
      { $group: { _id: null, value: { $sum: { $multiply: ['$price', '$stock'] } } } },
    ]);

    res.json({ lowStock, totalInventoryValue: totalInventoryValue[0]?.value || 0 });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get inventory report', error: error.message });
  }
};
