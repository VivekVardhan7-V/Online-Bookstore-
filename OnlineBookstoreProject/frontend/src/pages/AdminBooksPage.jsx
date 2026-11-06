import { useEffect, useState } from 'react';
import api from '../services/api';

const emptyForm = {
  title: '',
  author: '',
  ISBN: '',
  category: '',
  price: '',
  stock: '',
  description: '',
  image: '',
  featured: false,
  bestseller: false,
};

const AdminBooksPage = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState('');
  const [message, setMessage] = useState('');

  const fetchBooks = async () => {
    try {
      const params = new URLSearchParams({ limit: '50', search });
      const response = await api.get(`/books?${params.toString()}`);
      setBooks(response.data.books || []);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to load books');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, [search]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [e.target.name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/books/${editingId}`, form);
        setMessage('Book updated successfully');
      } else {
        await api.post('/books', form);
        setMessage('Book added successfully');
      }
      setEditingId('');
      setForm(emptyForm);
      fetchBooks();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to save book');
    }
  };

  const handleEdit = (book) => {
    setEditingId(book._id);
    setForm({
      title: book.title || '',
      author: book.author || '',
      ISBN: book.ISBN || '',
      category: book.category?._id || book.category || '',
      price: book.price ?? '',
      stock: book.stock ?? '',
      description: book.description || '',
      image: book.image || '',
      featured: Boolean(book.featured),
      bestseller: Boolean(book.bestseller),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId('');
    setForm(emptyForm);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this book? This cannot be undone.')) return;
    try {
      await api.delete(`/books/${id}`);
      setMessage('Book deleted successfully');
      fetchBooks();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to delete book');
    }
  };

  return (
    <div className="row g-4">
      <div className="col-lg-5">
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            <h3>{editingId ? 'Update Book' : 'Add Book'}</h3>
            {message && <div className="alert alert-info py-2">{message}</div>}
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-12"><input name="title" value={form.title} onChange={handleChange} className="form-control" placeholder="Title" required /></div>
                <div className="col-md-6"><input name="author" value={form.author} onChange={handleChange} className="form-control" placeholder="Author" required /></div>
                <div className="col-md-6"><input name="ISBN" value={form.ISBN} onChange={handleChange} className="form-control" placeholder="ISBN" required /></div>
                <div className="col-md-6"><select name="category" value={form.category} onChange={handleChange} className="form-select" required>
                  <option value="">Select category</option>
                  {categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
                </select></div>
                <div className="col-md-3"><input type="number" name="price" value={form.price} onChange={handleChange} className="form-control" placeholder="Price" required /></div>
                <div className="col-md-3"><input type="number" name="stock" value={form.stock} onChange={handleChange} className="form-control" placeholder="Stock" required /></div>
                <div className="col-12"><input name="image" value={form.image} onChange={handleChange} className="form-control" placeholder="Image URL" /></div>
                <div className="col-12"><textarea name="description" value={form.description} onChange={handleChange} className="form-control" placeholder="Description" rows="3" /></div>
                <div className="col-md-6 form-check mt-2"><input name="featured" checked={form.featured} onChange={handleChange} className="form-check-input" type="checkbox" /> <label className="form-check-label">Featured</label></div>
                <div className="col-md-6 form-check mt-2"><input name="bestseller" checked={form.bestseller} onChange={handleChange} className="form-check-input" type="checkbox" /> <label className="form-check-label">Bestseller</label></div>
              </div>
              <button type="submit" className="btn btn-warning text-dark w-100 mt-3">{editingId ? 'Update Book' : 'Save Book'}</button>
              {editingId && <button type="button" className="btn btn-outline-secondary w-100 mt-2" onClick={cancelEdit}>Cancel edit</button>}
            </form>
          </div>
        </div>
      </div>

      <div className="col-lg-7">
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
              <h3 className="mb-0">Book Inventory</h3>
              <input
                className="form-control"
                style={{ maxWidth: 320 }}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search title or author"
                aria-label="Search books"
              />
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book) => (
                    <tr key={book._id}>
                      <td>{book.title}</td>
                      <td>${Number(book.price).toFixed(2)}</td>
                      <td>{book.stock}</td>
                      <td className="text-nowrap">
                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(book)}>Edit</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(book._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBooksPage;
