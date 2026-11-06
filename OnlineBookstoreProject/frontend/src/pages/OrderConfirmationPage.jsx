import { Link, useLocation } from 'react-router-dom';

const OrderConfirmationPage = () => {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    return (
      <div className="text-center py-5">
        <h3>No order available</h3>
        <Link to="/books" className="btn btn-warning text-dark mt-3">Shop More</Link>
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-4">
        <div className="text-center mb-4">
          <h2 className="text-success">Order Confirmed</h2>
          <p className="mb-0">Thank you for shopping with BookNest.</p>
        </div>
        <div className="row g-4">
          <div className="col-md-6">
            <h4>Order Details</h4>
            <p><strong>Order Number:</strong> {order.orderNumber}</p>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Payment:</strong> {order.paymentStatus}</p>
            <p><strong>Total:</strong> ${Number(order.totalAmount).toFixed(2)}</p>
          </div>
          <div className="col-md-6">
            <h4>Shipping Address</h4>
            <p>{order.shippingAddress?.fullName}</p>
            <p>{order.shippingAddress?.address}</p>
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}</p>
            <p>{order.shippingAddress?.country}</p>
          </div>
        </div>
        <div className="mt-4 d-flex flex-wrap gap-3">
          <Link to="/orders" className="btn btn-dark">View Orders</Link>
          <Link to="/books" className="btn btn-warning text-dark">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
