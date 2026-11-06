import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FaBookReader, FaShoppingCart, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const navLinkClass = ({ isActive }) => `nav-link ${isActive ? 'active text-warning' : 'text-light'}`;

const Navbar = () => {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm sticky-top">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <FaBookReader size={24} className="text-warning" />
          <span className="fw-bold">BookNest</span>
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navMenu">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-lg-3">
            <li className="nav-item"><NavLink to="/" className={navLinkClass}>Home</NavLink></li>
            <li className="nav-item"><NavLink to="/books" className={navLinkClass}>Books</NavLink></li>
            <li className="nav-item"><NavLink  to="/orders" className={navLinkClass}>My Orders</NavLink></li>
            {user?.role === 'admin' && (
              <>
                <li className="nav-item"><NavLink to="/admin" className={navLinkClass}>Dashboard</NavLink></li>
                <li className="nav-item"><NavLink to="/admin/books" className={navLinkClass}>Books</NavLink></li>
                <li className="nav-item"><NavLink to="/admin/orders" className={navLinkClass}>Orders</NavLink></li>
                <li className="nav-item"><NavLink to="/admin/customers" className={navLinkClass}>Customers</NavLink></li>
                <li className="nav-item"><NavLink to="/admin/categories" className={navLinkClass}>Categories</NavLink></li>
              </>
            )}
          </ul>

          <div className="d-flex align-items-center gap-3">
            <Link to="/cart" className="position-relative text-light text-decoration-none">
              <FaShoppingCart size={20} />
              <span className="badge rounded-pill bg-warning text-dark position-absolute top-0 start-100 translate-middle">
                {items.length}
              </span>
            </Link>

            {user ? (
              <div className="dropdown">
                <button className="btn btn-outline-light dropdown-toggle d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown">
                  <FaUserCircle size={20} />
                  <span>{user.name}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li><Link className="dropdown-item" to="/profile">Profile</Link></li>
                  <li><Link className="dropdown-item" to="/orders">My Orders</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>
                </ul>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-light">Login</Link>
                <Link to="/register" className="btn btn-warning text-dark">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
