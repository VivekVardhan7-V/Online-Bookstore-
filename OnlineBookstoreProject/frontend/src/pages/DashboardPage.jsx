import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '../services/api';

const DashboardPage = () => {
  const [stats, setStats] = useState({});
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/dashboard');
        setStats(response.data || {});

        const salesResponse = await api.get('/admin/reports/sales');
        setChartData((salesResponse.data || []).map((item) => ({ name: item._id, sales: item.sales })));
      } catch (error) {
        console.error(error);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'Total Books', value: stats.totalBooks || 0 },
    { label: 'Total Categories', value: stats.totalCategories || 0 },
    { label: 'Registered Customers', value: stats.totalCustomers || 0 },
    { label: 'Total Orders', value: stats.totalOrders || 0 },
    { label: 'Total Sales', value: `$${Number(stats.totalSales || 0).toFixed(2)}` },
  ];

  return (
    <div>
      <h2 className="mb-4">Admin Dashboard</h2>
      <div className="row g-4 mb-4">
        {cards.map((item) => (
          <div key={item.label} className="col-md-6 col-xl-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted">{item.label}</div>
                <h3 className="mt-2 mb-0">{item.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body d-flex flex-wrap align-items-center gap-2">
          <strong className="me-2">Manage store</strong>
          <Link to="/admin/books" className="btn btn-sm btn-outline-dark">Add / edit books</Link>
          <Link to="/admin/orders" className="btn btn-sm btn-outline-dark">View / update orders</Link>
          <Link to="/admin/customers" className="btn btn-sm btn-outline-dark">Customer details</Link>
          <Link to="/admin/categories" className="btn btn-sm btn-outline-dark">Manage categories</Link>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <h4>Sales Overview</h4>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#f4b740" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h4>Low Stock</h4>
              <ul className="list-group list-group-flush">
                {(stats.lowStockBooks || []).map((book) => (
                  <li key={book._id} className="list-group-item d-flex justify-content-between">
                    <span>{book.title}</span>
                    <span>{book.stock} left</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h4>Recent Orders</h4>
              <ul className="list-group list-group-flush">
                {(stats.recentOrders || []).map((order) => (
                  <li key={order._id} className="list-group-item d-flex justify-content-between">
                    <span>{order.orderNumber} · {order.status}</span>
                    <Link to="/admin/orders" className="text-decoration-none">${Number(order.totalAmount).toFixed(2)} · View</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
