import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const HomePage = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await api.get('/books?limit=6');
        setBooks(response.data.books || []);
      } catch (error) {
        console.error(error);
      }
    };
    fetchBooks();
  }, []);

  return (
    <div>
      <section className="hero-section text-white rounded-4 p-4 p-md-5 mb-4">
        <div className="row align-items-center g-4">
          <div className="col-lg-7">
            <span className="badge bg-warning text-dark mb-3 px-3 py-2">New Collection</span>
            <h1 className="display-4 fw-bold">Discover stories that inspire every chapter of life.</h1>
            <p className="lead">Find bestselling fiction, practical business guides, and technology classics for learning and leisure.</p>
            <div className="d-flex flex-wrap gap-3">
              <Link to="/books" className="btn btn-warning btn-lg text-dark">Browse Books</Link>
              <Link to="/login" className="btn btn-outline-light btn-lg">Sign In</Link>
            </div>
          </div>
          <div className="col-lg-5 text-center">
            <img
              src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80"
              alt="Books"
              className="img-fluid rounded-4 shadow-lg"
              style={{ maxHeight: 420, objectFit: 'cover' }}
            />
          </div>
        </div>
      </section>

      <section className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Featured Titles</h2>
          <Link to="/books" className="btn btn-link text-dark p-0">View all</Link>
        </div>
        <div className="row g-4">
          {books.map((book) => (
            <div key={book._id} className="col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm book-card">
                <img src={book.image || 'https://placehold.co/600x800'} alt={book.title} className="card-img-top book-cover" />
                <div className="card-body d-flex flex-column">
                  <span className="text-muted small">{book.category?.name || 'General'}</span>
                  <h5 className="card-title mt-2">{book.title}</h5>
                  <p className="text-muted mb-1">by {book.author}</p>
                  <div className="mt-auto d-flex justify-content-between align-items-center">
                    <strong className="text-primary">${Number(book.price).toFixed(2)}</strong>
                    <Link to={`/books/${book._id}`} className="btn btn-sm btn-outline-dark">View</Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="info-box bg-light p-4 rounded-4 h-100">
            <h4>Best Sellers</h4>
            <p>Popular reads chosen by students, professionals, and curious readers.</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="info-box bg-primary-subtle p-4 rounded-4 h-100">
            <h4>New Arrivals</h4>
            <p>Fresh additions across fiction, business, technology, and science.</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="info-box bg-warning-subtle p-4 rounded-4 h-100">
            <h4>Special Deals</h4>
            <p>Seasonal discounts and curated bundles from our editorial picks.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
