import { useEffect, useState } from 'react';
import api from '../services/api';

const AdminCustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState('');

  const fetchCustomers = async () => {
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      const response = await api.get(`/admin/customers?${params.toString()}`);
      setCustomers(response.data || []);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to load customers');
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const openCustomer = async (customer) => {
    try {
      const response = await api.get(`/admin/customers/${customer._id}`);
      setSelected(response.data);
      setMessage('');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to load customer details');
    }
  };

  const toggleActive = async () => {
    if (!selected) return;
    const isActive = !selected.customer.isActive;
    try {
      const response = await api.patch(`/admin/customers/${selected.customer._id}/active`, { isActive });
      setSelected((current) => ({ ...current, customer: response.data }));
      await fetchCustomers();
      setMessage(`Customer account ${isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to update customer account');
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <h2 className="mb-0">Customers</h2>
        <input
          className="form-control"
          style={{ maxWidth: 360 }}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name, email, or phone"
          aria-label="Search customers"
        />
      </div>
      {message && <div className="alert alert-info">{message}</div>}
      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Joined</th><th>Account</th><th /></tr></thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer._id}>
                  <td>{customer.name}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phone || '—'}</td>
                  <td>{new Date(customer.createdAt).toLocaleDateString()}</td>
                  <td>{customer.isActive ? 'Active' : 'Inactive'}</td>
                  <td><button className="btn btn-sm btn-outline-primary" onClick={() => openCustomer(customer)}>View details</button></td>
                </tr>
              ))}
              {!customers.length && <tr><td colSpan="6" className="text-center py-4">No customers found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="modal-backdrop-custom" role="presentation">
          <div className="card border-0 shadow-lg customer-detail-panel" role="dialog" aria-modal="true" aria-labelledby="customer-detail-title">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h3 id="customer-detail-title">{selected.customer.name}</h3>
                  <div>{selected.customer.email} · {selected.customer.phone || 'No phone provided'}</div>
                  <div className="small text-muted">Joined {new Date(selected.customer.createdAt).toLocaleDateString()}</div>
                </div>
                <button className="btn-close" aria-label="Close customer details" onClick={() => setSelected(null)} />
              </div>
              <button className={`btn ${selected.customer.isActive ? 'btn-outline-danger' : 'btn-outline-success'} mb-3`} onClick={toggleActive}>
                {selected.customer.isActive ? 'Deactivate account' : 'Activate account'}
              </button>

              <h5>Order history ({selected.orders.length})</h5>
              {selected.orders.length ? selected.orders.map((order) => (
                <div className="border rounded-3 p-3 mb-2" key={order._id}>
                  <div className="d-flex flex-wrap justify-content-between gap-2">
                    <strong>{order.orderNumber}</strong>
                    <span>{order.status} · ${Number(order.totalAmount).toFixed(2)}</span>
                  </div>
                  <div className="small text-muted">{new Date(order.createdAt).toLocaleString()}</div>
                  <div className="small">
                    {order.trackingNumber ? `${order.carrier || 'Carrier'} tracking: ${order.trackingNumber}` : 'Tracking number not added'}
                    {order.estimatedDelivery && ` · Estimated delivery ${new Date(order.estimatedDelivery).toLocaleDateString()}`}
                  </div>
                </div>
              )) : <div className="text-muted">This customer has no orders.</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomersPage;
