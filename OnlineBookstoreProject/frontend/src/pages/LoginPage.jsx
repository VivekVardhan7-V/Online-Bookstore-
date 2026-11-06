import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo, { replace: true });
    }
  }, [user, navigate, location.state]);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form);
      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-lg-5">
        <div className="card shadow-sm border-0">
          <div className="card-body p-4 p-lg-5">
            <h2 className="mb-4">Welcome back</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} className="form-control" required />
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input type="password" name="password" value={form.password} onChange={handleChange} className="form-control" required />
              </div>
              <button type="submit" className="btn btn-warning text-dark w-100">Login</button>
            </form>
            <p className="mt-3 mb-0 text-center">
              New to BookNest? <Link to="/register">Create account</Link>
            </p>
            <div className="mt-3 small text-muted">Demo admin: admin@bookstore.com / Admin@123</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
