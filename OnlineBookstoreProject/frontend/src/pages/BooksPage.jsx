import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const BooksPage = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const params = new URLSearchParams({
          search,
          category,
          minPrice,
          maxPrice,
          sort,
          page,
          limit: '12',
        });
        const response = await api.get(`/books?${params.toString()}`);
        setBooks(response.data.books || []);
        setTotalPages(response.data.totalPages || 1);
      } catch (error) {
        console.error(error);
      }
    };

    fetchBooks();
  }, [search, category, minPrice, maxPrice, sort, page]);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h2>Browse Books</h2>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label">Search</label>
              <input value={search} onChange={(e) => setSearch(e.target.value)} className="form-control" placeholder="Title or author" />
            </div>
            <div className="col-md-2">
              <label className="form-label">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="form-select">
                <option value="">All</option>
                {categories.map((item) => (
                  <option key={item._id} value={item._id}>{item.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Min price</label>
              <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="form-control" placeholder="0" />
            </div>
            <div className="col-md-2">
              <label className="form-label">Max price</label>
              <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="form-control" placeholder="100" />
            </div>
            <div className="col-md-2">
              <label className="form-label">Sort</label>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="form-select">
                <option value="newest">Newest</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
                <option value="title">Title</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {books.map((book) => (
          <div key={book._id} className="col-md-6 col-lg-4">
            <div className="card h-100 border-0 shadow-sm book-card">
              <img src={book.image || 'https://placehold.co/600x800'} alt={book.title} className="card-img-top book-cover" />
              <div className="card-body d-flex flex-column">
                <span className="small text-muted">{book.category?.name || 'General'}</span>
                <h5 className="mt-2">{book.title}</h5>
                <p className="text-muted mb-2">by {book.author}</p>
                <div className="mt-auto d-flex justify-content-between align-items-center">
                  <strong className="text-primary">${Number(book.price).toFixed(2)}</strong>
                  <Link to={`/books/${book._id}`} className="btn btn-sm btn-outline-dark">Details</Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="d-flex justify-content-center mt-4 gap-2">
        <button className="btn btn-outline-dark" disabled={page === 1} onClick={() => setPage((prev) => prev - 1)}>Previous</button>
        <span className="align-self-center">Page {page} of {totalPages}</span>
        <button className="btn btn-outline-dark" disabled={page >= totalPages} onClick={() => setPage((prev) => prev + 1)}>Next</button>
      </div>
    </div>
  );
};

export default BooksPage;
