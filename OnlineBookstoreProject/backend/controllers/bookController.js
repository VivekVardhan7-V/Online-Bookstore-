import Book from '../models/Book.js';
import Category from '../models/Category.js';

export const getBooks = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const sortMap = {
      newest: { createdAt: -1 },
      priceLow: { price: 1 },
      priceHigh: { price: -1 },
      title: { title: 1 },
    };

    const books = await Book.find(query)
      .populate('category')
      .sort(sortMap[sort] || { createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Book.countDocuments(query);

    return res.json({ books, totalPages: Math.ceil(total / Number(limit)), currentPage: Number(page), total });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch books', error: error.message });
  }
};

export const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('category');
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const relatedBooks = await Book.find({ category: book.category._id, _id: { $ne: book._id } }).limit(4);
    return res.json({ book, relatedBooks });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch the book', error: error.message });
  }
};

export const createBook = async (req, res) => {
  try {
    const { title, author, ISBN, description, category, price, stock, image, featured, bestseller, publishedYear } = req.body;

    if (!title || !author || !ISBN || !category || price === undefined || stock === undefined) {
      return res.status(400).json({ message: 'Missing required book fields' });
    }

    if (!Number.isFinite(Number(price)) || Number(price) < 0 || !Number.isInteger(Number(stock)) || Number(stock) < 0) {
      return res.status(400).json({ message: 'Price and stock must be valid non-negative numbers' });
    }

    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.status(400).json({ message: 'Category not found' });
    }

    const book = await Book.create({
      title,
      author,
      ISBN,
      description,
      category,
      price: Number(price),
      stock: Number(stock),
      image: image || '',
      featured: Boolean(featured),
      bestseller: Boolean(bestseller),
      publishedYear: publishedYear || new Date().getFullYear(),
      isAvailable: Number(stock) > 0,
    });

    return res.status(201).json(book);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'A book with this ISBN already exists' });
    }
    return res.status(500).json({ message: 'Failed to create book', error: error.message });
  }
};

export const updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const allowedFields = ['title', 'author', 'ISBN', 'description', 'category', 'price', 'stock', 'image', 'featured', 'bestseller', 'publishedYear'];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([field]) => allowedFields.includes(field))
    );

    if (updates.category) {
      const categoryExists = await Category.exists({ _id: updates.category });
      if (!categoryExists) {
        return res.status(400).json({ message: 'Category not found' });
      }
    }
    if (updates.price !== undefined) {
      updates.price = Number(updates.price);
      if (!Number.isFinite(updates.price) || updates.price < 0) {
        return res.status(400).json({ message: 'Price must be a non-negative number' });
      }
    }
    if (updates.stock !== undefined) {
      updates.stock = Number(updates.stock);
      if (!Number.isInteger(updates.stock) || updates.stock < 0) {
        return res.status(400).json({ message: 'Stock must be a non-negative whole number' });
      }
      updates.isAvailable = updates.stock > 0;
    }

    Object.assign(book, updates);
    await book.save();

    return res.json(book);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'A book with this ISBN already exists' });
    }
    return res.status(500).json({ message: 'Failed to update book', error: error.message });
  }
};

export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete book', error: error.message });
  }
};
