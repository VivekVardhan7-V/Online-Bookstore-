import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';

const BookDetailsPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [book, setBook] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await api.get(`/books/${id}`);
        setBook(response.data.book || null);
        setRelatedBooks(response.data.relatedBooks || []);
      } catch (error) {
        console.error(error);
      }
    };
    fetchBook();
  }, [id]);

  const handleAddToCart = async () => {
    if (!book) return;
    await addToCart(book, quantity);
    alert('Item added to cart');
  };

  if (!book) {
    return <div className="text-center py-5">Loading book details...</div>;
  }

  return (
    <div>
      <div className="row g-4">
        <div className="col-lg-5">
          <img src={book.image || 'https://placehold.co/900x1200'} alt={book.title} className="img-fluid rounded-4 shadow-sm w-100" style={{ maxHeight: 640, objectFit: 'cover' }} />
        </div>
        <div className="col-lg-7">
          <span className="badge bg-light text-dark border">{book.category?.name || 'General'}</span>
          <h1 className="mt-3">{book.title}</h1>
          <h5 className="text-muted">by {book.author}</h5>
          <p className="display-6 text-primary">${Number(book.price).toFixed(2)}</p>
          <p>{book.description}</p>
          <div className="d-flex align-items-center gap-3 my-3">
            <label className="fw-semibold">Qty</label>
            <input type="number" min="1" max={book.stock || 1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="form-control w-auto" />
          </div>
          <div className="d-flex gap-3 flex-wrap mb-3">
            <button className="btn btn-warning text-dark btn-lg" onClick={handleAddToCart}>Add to Cart</button>
            <Link to="/cart" className="btn btn-outline-dark btn-lg">Go to Cart</Link>
          </div>
          <ul className="list-group list-group-flush border rounded-3">
            <li className="list-group-item"><strong>ISBN:</strong> {book.ISBN}</li>
            <li className="list-group-item"><strong>Availability:</strong> {book.stock > 0 ? `${book.stock} in stock` : 'Out of stock'}</li>
            <li className="list-group-item"><strong>Published:</strong> {book.publishedYear || 'Not specified'}</li>
          </ul>
        </div>
      </div>

      {relatedBooks.length > 0 && (
        <section className="mt-5">
          <h3>Related Books</h3>
          <div className="row g-4">
            {relatedBooks.map((item) => (
              <div key={item._id} className="col-md-3">
                <div className="card h-100 border-0 shadow-sm">
                  <img src={item.image || 'https://placehold.co/600x800'} alt={item.title} className="card-img-top" style={{ height: 220, objectFit: 'cover' }} />
                  <div className="card-body">
                    <h6>{item.title}</h6>
                    <Link to={`/books/${item._id}`} className="btn btn-sm btn-outline-dark">View</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default BookDetailsPage;
