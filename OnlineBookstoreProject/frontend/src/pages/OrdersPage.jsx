import { useEffect, useState } from 'react';
import api from '../services/api';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders/my-orders');
        setOrders(response.data || []);
      } catch (error) {
        console.error(error);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div>
      <h2 className="mb-4">My Orders</h2>
      {orders.length === 0 ? (
        <div className="alert alert-light border">No orders yet.</div>
      ) : (
        <div className="row g-4">
          {orders.map((order) => (
            <div key={order._id} className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between flex-wrap gap-2 mb-3">
                    <div>
                      <strong>{order.orderNumber}</strong>
                    </div>
                    <div className="text-muted">{new Date(order.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="d-flex justify-content-between flex-wrap gap-2">
                    <span>Status: <strong>{order.status}</strong></span>
                    <span>Payment: <strong>{order.paymentStatus}</strong></span>
                    <span>Total: <strong>${Number(order.totalAmount).toFixed(2)}</strong></span>
                  </div>
                  <div className="tracking-summary mt-3 p-3 rounded-3">
                    <div className="fw-semibold">Delivery tracking</div>
                    <div>
                      {order.carrier ? `${order.carrier}${order.trackingNumber ? ` · ${order.trackingNumber}` : ''}` : 'Carrier details will appear when your order ships.'}
                    </div>
                    {order.estimatedDelivery && <div>Estimated delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}</div>}
                    {(order.trackingHistory || []).length > 0 && (
                      <ol className="tracking-timeline mt-2 mb-0">
                        {order.trackingHistory.slice().reverse().map((event, index) => (
                          <li key={`${event.status}-${event.updatedAt}-${index}`}>
                            <strong>{event.status}</strong>
                            <span className="small text-muted"> · {new Date(event.updatedAt).toLocaleString()}</span>
                            {event.location && <div className="small">{event.location}</div>}
                            {event.note && <div className="small text-muted">{event.note}</div>}
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                  <ul className="list-group list-group-flush mt-3">
                    {order.items.map((item, index) => (
                      <li key={`${order._id}-${index}`} className="list-group-item d-flex justify-content-between">
                        <span>{item.title} x {item.quantity}</span>
                        <span>${(Number(item.price) * Number(item.quantity)).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
