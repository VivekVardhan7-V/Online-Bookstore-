import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Book from '../models/Book.js';

export const seedData = async () => {
  const adminExists = await User.findOne({ email: 'admin@bookstore.com' });

  if (!adminExists) {
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    await User.create({
      name: 'System Admin',
      email: 'admin@bookstore.com',
      phone: '+1-555-0101',
      passwordHash: adminPassword,
      role: 'admin',
      isActive: true,
    });
  }

  const categoryCount = await Category.countDocuments();
  if (categoryCount === 0) {
    const categories = [
      { name: 'Fiction', slug: 'fiction', description: 'Narrative stories and literary fiction' },
      { name: 'Technology', slug: 'technology', description: 'Programming, software engineering and tech books' },
      { name: 'Business', slug: 'business', description: 'Growth, leadership and entrepreneurship' },
      { name: 'Science', slug: 'science', description: 'Science and discovery' },
    ];

    const createdCategories = await Category.insertMany(categories);

    const books = [
      {
        title: 'The Midnight Library',
        author: 'Matt Haig',
        ISBN: '978-0-525-55997-9',
        description: 'A thought-provoking novel about second chances and life choices.',
        category: createdCategories[0]._id,
        price: 18.99,
        stock: 20,
        image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80',
        featured: true,
        bestseller: true,
        publishedYear: 2020,
      },
      {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        ISBN: '978-0-13-235088-4',
        description: 'A practical guide to writing maintainable and clean software.',
        category: createdCategories[1]._id,
        price: 29.99,
        stock: 15,
        image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=900&q=80',
        featured: true,
        bestseller: true,
        publishedYear: 2008,
      },
      {
        title: 'Atomic Habits',
        author: 'James Clear',
        ISBN: '978-0-73-521129-2',
        description: 'An actionable framework for building better routines and systems.',
        category: createdCategories[2]._id,
        price: 23.5,
        stock: 12,
        image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=900&q=80',
        featured: false,
        bestseller: true,
        publishedYear: 2018,
      },
      {
        title: 'A Brief History of Time',
        author: 'Stephen Hawking',
        ISBN: '978-0-553-10953-5',
        description: 'An accessible introduction to cosmology and the universe.',
        category: createdCategories[3]._id,
        price: 27.75,
        stock: 10,
        image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=900&q=80',
        featured: true,
        bestseller: false,
        publishedYear: 1988,
      },
    ];

    await Book.insertMany(books);
  }
};
