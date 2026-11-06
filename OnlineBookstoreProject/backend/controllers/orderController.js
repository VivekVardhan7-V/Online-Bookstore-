import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Book from '../models/Book.js';
import User from '../models/User.js';

const isTransactionUnavailable = (error) => {
  const message = error.message || '';
  return (
    error.code === 20 ||
    /transaction numbers are only allowed|does not support transactions|transactions are not supported|replica set member or mongos/i.test(
      message
    )
  );
};

const makeOrderItems = (books, cartItems) => {
  return cartItems.map((item) => {
    const book = books.find((entry) => entry._id.toString() === item.book._id.toString());

    if (!book) {
      const error = new Error(`Book ${item.title} is no longer available`);
      error.statusCode = 409;
      throw error;
    }

    return {
      book: book._id,
      title: book.title,
      price: book.price,
      quantity: item.quantity,
      image: book.image,
    };
  });
};

const makeOrderDocument = (userId, items, shippingAddress, paymentMethod) => ({
  user: userId,
  orderNumber: `BK-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
  items,
  shippingAddress,
  paymentMethod,
  totalAmount: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  status: 'Processing',
  paymentStatus: 'Paid',
  trackingHistory: [{ status: 'Processing', note: 'Order placed', updatedAt: new Date() }],
});

const syncBookAvailability = async (book, session) => {
  const query = Book.updateOne(
    { _id: book._id, stock: book.stock },
    { $set: { isAvailable: book.stock > 0 } }
  );

  if (session) {
    query.session(session);
  }

  await query;
};

const createOrderWithTransaction = async (session, req, cart) => {
  let createdOrder;

  await session.withTransaction(async () => {
    const books = [];

    for (const item of cart.items) {
      const book = await Book.findOneAndUpdate(
        { _id: item.book._id, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true, session }
      );

      if (!book) {
        const error = new Error(`Not enough stock for ${item.title}`);
        error.statusCode = 409;
        throw error;
      }

      await syncBookAvailability(book, session);
      books.push(book);
    }

    const items = makeOrderItems(books, cart.items);
    [createdOrder] = await Order.create(
      [makeOrderDocument(req.user._id, items, req.body.shippingAddress, req.body.paymentMethod)],
      { session }
    );
  });

  return createdOrder;
};

const createOrderWithoutTransaction = async (req, cart) => {
  const reservedBooks = [];
  let createdOrder;

  try {
    const books = [];

    for (const item of cart.items) {
      const book = await Book.findOneAndUpdate(
        { _id: item.book._id, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );

      if (!book) {
        const error = new Error(`Not enough stock for ${item.title}`);
        error.statusCode = 409;
        throw error;
      }

      reservedBooks.push({ id: book._id, quantity: item.quantity });
      await syncBookAvailability(book);
      books.push(book);
    }

    const items = makeOrderItems(books, cart.items);
    createdOrder = await Order.create(makeOrderDocument(req.user._id, items, req.body.shippingAddress, req.body.paymentMethod));
    return createdOrder;
  } catch (error) {
    for (const reservation of reservedBooks) {
      try {
        const book = await Book.findByIdAndUpdate(
          reservation.id,
          { $inc: { stock: reservation.quantity } },
          { new: true }
        );
        if (book) {
          await syncBookAvailability(book);
        }
      } catch (rollbackError) {
        console.error(`Failed to restore inventory for book ${reservation.id}:`, rollbackError);
        error.message = `${error.message}. Inventory rollback also failed for book ${reservation.id}.`;
      }
    }

    if (createdOrder) {
      await Order.findByIdAndDelete(createdOrder._id);
    }

    throw error;
  }
};

export const createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;
    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({ message: 'Shipping address and payment method are required' });
    }

    let cart = await Cart.findOne({ user: req.user._id }).populate('items.book');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const session = await mongoose.startSession();
    let createdOrder;
    try {
      createdOrder = await createOrderWithTransaction(session, req, cart);
    } catch (error) {
      if (!isTransactionUnavailable(error)) {
        throw error;
      }

      console.warn('MongoDB transactions unavailable; creating order with atomic inventory updates.');
      createdOrder = await createOrderWithoutTransaction(req, cart);
    } finally {
      await session.endSession();
    }

    await Cart.deleteOne({ user: req.user._id });

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Failed to create order:', error);
    res.status(error.statusCode || 500).json({ message: error.message || 'Failed to create order' });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch your orders', error: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const { search = '', status, from, to } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) {
        const endDate = new Date(to);
        endDate.setDate(endDate.getDate() + 1);
        query.createdAt.$lt = endDate;
      }
    }
    if (search.trim()) {
      const matchingUsers = await User.find({
        $or: [
          { name: { $regex: search.trim(), $options: 'i' } },
          { email: { $regex: search.trim(), $options: 'i' } },
        ],
      }).select('_id');
      query.$or = [
        { orderNumber: { $regex: search.trim(), $options: 'i' } },
        { user: { $in: matchingUsers.map((user) => user._id) } },
      ];
    }

    const orders = await Order.find(query).populate('user', 'name email phone').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to access this order' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch order', error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber, carrier, estimatedDelivery, trackingNote, trackingLocation, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const allowedStatuses = ['Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
    const allowedPaymentStatuses = ['Pending', 'Paid', 'Failed'];
    if (status !== undefined && !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }
    if (paymentStatus !== undefined && !allowedPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({ message: 'Invalid payment status' });
    }

    const previousStatus = order.status;
    if (status !== undefined) order.status = status;
    if (paymentStatus !== undefined) order.paymentStatus = paymentStatus;
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber.trim();
    if (carrier !== undefined) order.carrier = carrier.trim();
    if (estimatedDelivery !== undefined) {
      order.estimatedDelivery = estimatedDelivery ? new Date(estimatedDelivery) : null;
      if (estimatedDelivery && Number.isNaN(order.estimatedDelivery.getTime())) {
        return res.status(400).json({ message: 'Estimated delivery date is invalid' });
      }
    }
    if (status && (status !== previousStatus || trackingNote || trackingLocation)) {
      order.trackingHistory.push({
        status,
        note: trackingNote || '',
        location: trackingLocation || '',
        updatedAt: new Date(),
      });
    }

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order status', error: error.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not allowed to cancel this order' });
    }

    order.status = 'Cancelled';
    order.trackingHistory.push({
      status: 'Cancelled',
      note: 'Order cancelled',
      updatedAt: new Date(),
    });
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Failed to cancel order', error: error.message });
  }
};
