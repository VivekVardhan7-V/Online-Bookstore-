import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="container py-4">
        <Outlet />
      </main>
      <footer className="bg-dark text-light mt-5 py-4">
        <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
          <div>
            <strong>BookNest</strong> © 2026
          </div>
          <div>info@booknest.com • +91 9966332211</div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
