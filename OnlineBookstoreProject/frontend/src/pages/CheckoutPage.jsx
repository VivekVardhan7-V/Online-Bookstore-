import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    paymentMethod: 'Credit Card',
  });

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post('/orders', {
        shippingAddress: form,
        paymentMethod: form.paymentMethod,
      });
      clearCart();
      navigate('/confirmation', { state: { order: response.data } });
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data?.error || error.message || 'Checkout failed';
      alert(message);
    }
  };

  return (
    <div className="row g-4">
      <div className="col-lg-7">
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            <h2 className="mb-4">Checkout</h2>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6"><label className="form-label">Full name</label><input name="fullName" value={form.fullName} onChange={handleChange} className="form-control" required /></div>
                <div className="col-md-6"><label className="form-label">Email</label><input type="email" name="email" value={form.email} onChange={handleChange} className="form-control" required /></div>
                <div className="col-md-6"><label className="form-label">Phone</label><input name="phone" value={form.phone} onChange={handleChange} className="form-control" required /></div>
                <div className="col-md-6"><label className="form-label">Country</label><input name="country" value={form.country} onChange={handleChange} className="form-control" required /></div>
                <div className="col-12"><label className="form-label">Address</label><input name="address" value={form.address} onChange={handleChange} className="form-control" required /></div>
                <div className="col-md-4"><label className="form-label">City</label><input name="city" value={form.city} onChange={handleChange} className="form-control" required /></div>
                <div className="col-md-4"><label className="form-label">State</label><input name="state" value={form.state} onChange={handleChange} className="form-control" required /></div>
                <div className="col-md-4"><label className="form-label">Postal code</label><input name="postalCode" value={form.postalCode} onChange={handleChange} className="form-control" required /></div>
                <div className="col-12">
                  <label className="form-label">Payment method</label>
                  <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} className="form-select">
                    <option>Credit Card</option>
                    <option>PayPal</option>
                    <option>Cash on Delivery</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-warning text-dark mt-4 w-100">Place Order</button>
            </form>
          </div>
        </div>
      </div>

      <div className="col-lg-5">
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <h4>Your Order</h4>
            {items.map((item) => (
              <div key={item.book || item._id} className="d-flex justify-content-between my-2">
                <span>{item.title} x {item.quantity}</span>
                <strong>${(Number(item.price) * Number(item.quantity)).toFixed(2)}</strong>
              </div>
            ))}
            <hr />
            <div className="d-flex justify-content-between"><span>Subtotal</span><strong>${subtotal.toFixed(2)}</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
