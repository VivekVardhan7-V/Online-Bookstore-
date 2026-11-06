import Cart from '../models/Cart.js';
import Book from '../models/Book.js';

export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.book');
    res.json(cart || { user: req.user._id, items: [] });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get cart', error: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { bookId, quantity = 1 } = req.body;
    if (!bookId) return res.status(400).json({ message: 'Book id is required' });

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const finalQty = Number(quantity);
    if (finalQty > book.stock) {
      return res.status(400).json({ message: 'Requested quantity exceeds available stock' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingItem = cart.items.find((item) => item.book.toString() === bookId);
    if (existingItem) {
      const totalQty = existingItem.quantity + finalQty;
      if (totalQty > book.stock) {
        return res.status(400).json({ message: 'Cart quantity exceeds available stock' });
      }
      existingItem.quantity = totalQty;
    } else {
      cart.items.push({
        book: book._id,
        title: book.title,
        price: book.price,
        quantity: finalQty,
        image: book.image,
      });
    }

    await cart.save();
    res.status(201).json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add item to cart', error: error.message });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.find((entry) => entry.book.toString() === req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Cart item not found' });

    const book = await Book.findById(req.params.itemId);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const nextQuantity = Number(quantity);
    if (nextQuantity < 1 || nextQuantity > book.stock) {
      return res.status(400).json({ message: 'Quantity is invalid or exceeds stock' });
    }

    item.quantity = nextQuantity;
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update cart item', error: error.message });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter((item) => item.book.toString() !== req.params.itemId);
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove item', error: error.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    await Cart.deleteOne({ user: req.user._id });
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to clear cart', error: error.message });
  }
};
