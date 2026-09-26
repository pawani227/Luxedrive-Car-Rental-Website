import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { FaCar, FaBars, FaTimes, FaUser, FaSignOutAlt } from 'react-icons/fa';
import './Navbar.css';

export default function Navbar() {
  // Get the current user and logout function from the auth context.
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'provider') return '/provider/dashboard';
    return '/customer/dashboard';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
          <FaCar /> LuxeDrive
        </Link>

        <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>

        <ul className={`nav-menu ${menuOpen ? 'active' : ''}`}>
          <li><Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>Home</Link></li>
          <li><Link to="/about" className="nav-link" onClick={() => setMenuOpen(false)}>About Us</Link></li>
          
          {/* ✅ Contact Link Added Here */}
          <li><Link to="/contact" className="nav-link" onClick={() => setMenuOpen(false)}>Contact</Link></li>

          <li><Link to="/vehicles" className="nav-link" onClick={() => setMenuOpen(false)}>Vehicles</Link></li>

          <li><Link to="/feedback" className="nav-link" onClick={() => setMenuOpen(false)}>Feedback</Link></li>

          {user ? (
            <>
              <li>
                <Link to={getDashboardLink()} className="nav-link" onClick={() => setMenuOpen(false)}>
                  {user.role === 'admin' ? 'Admin Dashboard' : 'Dashboard'}
                </Link>
              </li>
              {user.role !== 'admin' && (
                <li className="nav-user-info">
                  <FaUser /> <span>{user.name}</span>
                  <span className="user-role">({user.role})</span>
                </li>
              )}
              <li>
                <button className="nav-btn logout-btn" onClick={handleLogout}>
                  <FaSignOutAlt /> Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login" className="nav-link" onClick={() => setMenuOpen(false)}>Login</Link></li>
              <li>
                <Link to="/register" className="nav-btn register-btn" onClick={() => setMenuOpen(false)}>
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}