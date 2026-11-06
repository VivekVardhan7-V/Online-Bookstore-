import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    ISBN: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    image: { type: String, default: '' },
    featured: { type: Boolean, default: false },
    bestseller: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    publishedYear: { type: Number, default: new Date().getFullYear() },
  },
  { timestamps: true }
);

const Book = mongoose.model('Book', bookSchema);

export default Book;
