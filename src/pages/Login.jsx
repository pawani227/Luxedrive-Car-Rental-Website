import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { loginUser } from '../services/userService.js';
import { FaEnvelope, FaLock, FaCar } from 'react-icons/fa';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let userData = null;

      // Check the built-in demo accounts first for quick access during testing.
      if (email === 'admin@luxedrive.com' && password === 'admin123') {
        userData = {
          _id: 'admin1',
          name: 'Admin User',
          email: 'admin@luxedrive.com',
          role: 'admin',
          token: 'mock-admin-token'
        };
      } else if (email === 'provider@luxedrive.com' && password === 'provider123') {
        userData = {
          _id: 'provider1',
          name: 'Premium Rentals',
          email: 'provider@luxedrive.com',
          role: 'provider',
          companyName: 'Premium Auto Rentals Pvt Ltd',
          phone: '+94 11 234 5678',
          token: 'mock-provider-token'
        };
      } else if (email === 'customer@luxedrive.com' && password === 'customer123') {
        userData = {
          _id: 'customer1',
          name: 'John Doe',
          email: 'customer@luxedrive.com',
          role: 'customer',
          phone: '+94 77 123 4567',
          token: 'mock-customer-token'
        };
      } else {
        // Authenticate via backend database API
        userData = await loginUser({ email, password });
      }

      if (userData) {
        if (userData.token) {
          localStorage.setItem('token', userData.token);
        }
        login(userData);
        alert('Login successful! Welcome back, ' + userData.name + '!');
        
        // Redirect based on role
        if (userData.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (userData.role === 'provider') {
          navigate('/provider/dashboard');
        } else {
          navigate('/customer/dashboard');
        }
      } else {
        alert('Invalid email or password!\n\nPlease check your credentials and try again.');
      }
    } catch (err) {
      alert('Login failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-left">
          <FaCar className="auth-icon" />
          <h2>Welcome Back!</h2>
          <p>Login to access your account and manage your vehicle rentals with LuxeDrive.</p>
          <div className="features-list">
            <p>✓ Browse premium vehicles</p>
            <p>✓ Easy booking process</p>
            <p>✓ Secure payments</p>
            <p>✓ 24/7 customer support</p>
          </div>
        </div>
        <div className="auth-right">
          <h2>Login to LuxeDrive</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label><FaEnvelope /> Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="form-group">
              <label><FaLock /> Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <p className="auth-switch">
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}