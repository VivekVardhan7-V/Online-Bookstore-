import { useEffect, useState } from 'react';
import api from '../services/api';

const statuses = ['Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
const emptyTracking = {
  status: 'Processing',
  carrier: '',
  trackingNumber: '',
  estimatedDelivery: '',
  trackingNote: '',
  trackingLocation: '',
  paymentStatus: 'Pending',
};

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [tracking, setTracking] = useState(emptyTracking);
  const [message, setMessage] = useState('');

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.search.trim()) params.set('search', filters.search.trim());
      if (filters.status) params.set('status', filters.status);
      const response = await api.get(`/orders?${params.toString()}`);
      setOrders(response.data || []);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to load orders');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const selectOrder = (order) => {
    setSelectedOrder(order);
    setTracking({
      status: order.status,
      carrier: order.carrier || '',
      trackingNumber: order.trackingNumber || '',
      estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery).toISOString().slice(0, 10) : '',
      trackingNote: '',
      trackingLocation: '',
      paymentStatus: order.paymentStatus || 'Pending',
    });
    setMessage('');
  };

  const handleTrackingChange = (event) => {
    setTracking((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const saveOrder = async (event) => {
    event.preventDefault();
    if (!selectedOrder) return;

    try {
      const response = await api.patch(`/orders/${selectedOrder._id}/status`, tracking);
      setSelectedOrder(response.data);
      setMessage('Order and tracking details updated');
      await fetchOrders();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to update order');
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <h2 className="mb-0">Order Management</h2>
        <div className="d-flex gap-2 flex-wrap">
          <input
            className="form-control"
            placeholder="Search order or customer"
            aria-label="Search orders"
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
          />
          <select
            className="form-select"
            aria-label="Filter order status"
            value={filters.status}
            onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
          >
            <option value="">All statuses</option>
            {statuses.map((status) => <option key={status}>{status}</option>)}
          </select>
        </div>
      </div>

      {message && <div className="alert alert-info">{message}</div>}
      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Total</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order.orderNumber}</td>
                  <td>{order.user?.name || order.shippingAddress?.fullName}<div className="small text-muted">{order.user?.email}</div></td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td><span className="badge text-bg-secondary">{order.status}</span></td>
                  <td>{order.paymentStatus}</td>
                  <td>${Number(order.totalAmount).toFixed(2)}</td>
                  <td><button className="btn btn-sm btn-outline-primary" onClick={() => selectOrder(order)}>View / update</button></td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan="7" className="text-center py-4">No orders found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <div className="modal-backdrop-custom" role="presentation">
          <div className="card border-0 shadow-lg order-detail-panel" role="dialog" aria-modal="true" aria-labelledby="order-detail-title">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
                <div>
                  <h3 id="order-detail-title">Order {selectedOrder.orderNumber}</h3>
                  <div>{selectedOrder.user?.name || selectedOrder.shippingAddress?.fullName} · {selectedOrder.user?.email || selectedOrder.shippingAddress?.email}</div>
                  <div className="small text-muted">{selectedOrder.user?.phone || selectedOrder.shippingAddress?.phone}</div>
                </div>
                <button className="btn-close" aria-label="Close order details" onClick={() => setSelectedOrder(null)} />
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <h6>Shipping address</h6>
                  <div>{selectedOrder.shippingAddress?.address}</div>
                  <div>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.postalCode}</div>
                  <div>{selectedOrder.shippingAddress?.country}</div>
                </div>
                <div className="col-md-6">
                  <h6>Items</h6>
                  {selectedOrder.items.map((item, index) => (
                    <div key={`${selectedOrder._id}-${index}`} className="d-flex justify-content-between">
                      <span>{item.title} × {item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <strong className="d-block text-end mt-2">Total: ${Number(selectedOrder.totalAmount).toFixed(2)}</strong>
                </div>
              </div>

              <h5>Update status and tracking</h5>
              <form onSubmit={saveOrder}>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">Order status</label>
                    <select name="status" value={tracking.status} onChange={handleTrackingChange} className="form-select">
                      {statuses.map((status) => <option key={status}>{status}</option>)}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Payment status</label>
                    <select name="paymentStatus" value={tracking.paymentStatus} onChange={handleTrackingChange} className="form-select">
                      {['Pending', 'Paid', 'Failed'].map((status) => <option key={status}>{status}</option>)}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Carrier</label>
                    <input name="carrier" value={tracking.carrier} onChange={handleTrackingChange} className="form-control" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Tracking number</label>
                    <input name="trackingNumber" value={tracking.trackingNumber} onChange={handleTrackingChange} className="form-control" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Estimated delivery</label>
                    <input type="date" name="estimatedDelivery" value={tracking.estimatedDelivery} onChange={handleTrackingChange} className="form-control" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Tracking note</label>
                    <input name="trackingNote" value={tracking.trackingNote} onChange={handleTrackingChange} className="form-control" placeholder="Package handed to carrier" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Current location</label>
                    <input name="trackingLocation" value={tracking.trackingLocation} onChange={handleTrackingChange} className="form-control" placeholder="Distribution center" />
                  </div>
                </div>
                <button className="btn btn-warning text-dark mt-3" type="submit">Save order updates</button>
              </form>

              <hr />
              <h5>Tracking history</h5>
              {(selectedOrder.trackingHistory || []).length ? (
                <ul className="list-group">
                  {selectedOrder.trackingHistory.slice().reverse().map((event, index) => (
                    <li key={`${event.status}-${event.updatedAt}-${index}`} className="list-group-item">
                      <strong>{event.status}</strong> · {new Date(event.updatedAt).toLocaleString()}
                      {event.location && <div>{event.location}</div>}
                      {event.note && <div className="text-muted">{event.note}</div>}
                    </li>
                  ))}
                </ul>
              ) : <div className="text-muted">No tracking updates yet.</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
