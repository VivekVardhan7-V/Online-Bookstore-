import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const CartPage = () => {
  const { items, subtotal, updateQuantity, removeFromCart, clearCart } = useCart();

  if (!items.length) {
    return (
      <div className="text-center py-5">
        <h3>Your cart is empty</h3>
        <Link to="/books" className="btn btn-warning text-dark mt-3">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="row g-4">
      <div className="col-lg-8">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Shopping Cart</h2>
          <button className="btn btn-outline-danger btn-sm" onClick={clearCart}>Clear Cart</button>
        </div>
        {items.map((item) => (
          <div key={item.book || item._id} className="card mb-3 border-0 shadow-sm">
            <div className="card-body d-flex flex-column flex-md-row gap-3 align-items-center">
              <img src={item.image || 'https://placehold.co/150x200'} alt={item.title} style={{ width: 120, height: 150, objectFit: 'cover' }} className="rounded" />
              <div className="flex-grow-1">
                <h5>{item.title}</h5>
                <p className="mb-1 text-primary fw-semibold">${Number(item.price).toFixed(2)}</p>
                <div className="d-flex align-items-center gap-2 mt-2">
                  <button className="btn btn-sm btn-outline-dark" onClick={() => updateQuantity(item.book || item._id, Math.max(1, Number(item.quantity) - 1))}>-</button>
                  <span>{item.quantity}</span>
                  <button className="btn btn-sm btn-outline-dark" onClick={() => updateQuantity(item.book || item._id, Number(item.quantity) + 1)}>+</button>
                </div>
              </div>
              <div className="text-end">
                <div className="fw-bold">${(Number(item.price) * Number(item.quantity)).toFixed(2)}</div>
                <button className="btn btn-link text-danger p-0 mt-2" onClick={() => removeFromCart(item.book || item._id)}>Remove</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="col-lg-4">
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <h4>Order Summary</h4>
            <div className="d-flex justify-content-between my-3">
              <span>Subtotal</span>
              <strong>${subtotal.toFixed(2)}</strong>
            </div>
            <div className="d-flex justify-content-between my-3">
              <span>Shipping</span>
              <strong>Free</strong>
            </div>
            <hr />
            <div className="d-flex justify-content-between mb-3">
              <span>Total</span>
              <strong>${subtotal.toFixed(2)}</strong>
            </div>
            <Link to="/checkout" className="btn btn-warning text-dark w-100">Proceed to Checkout</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
