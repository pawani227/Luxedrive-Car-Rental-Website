import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { registerUser } from '../services/userService.js';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt, FaCar, FaBuilding, FaIdCard } from 'react-icons/fa';
import './Login.css';
import './Register.css';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    phone: '',
    address: '',
    companyName: '',
    licenseNo: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    let { name, value } = e.target;

    // Phone: numeric only, max 10 digits
    if (name === 'phone') {
      value = value.replace(/[^0-9]/g, '').slice(0, 10);
    }

    // Password: max 8 characters
    if (name === 'password' || name === 'confirmPassword') {
      value = value.slice(0, 8);
    }

    // Driving licence: English alphanumeric only, max 7 chars
    if (name === 'licenseNo') {
      value = value.replace(/[^A-Za-z0-9]/g, '').slice(0, 7).toUpperCase();
    }

    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      alert('Password must be exactly 8 characters long!');
      setLoading(false);
      return;
    }

    if (!/[0-9]/.test(formData.password)) {
      alert('Password must contain at least one number!');
      setLoading(false);
      return;
    }

    // Phone validation: must be exactly 10 digits if provided
    if (formData.phone && formData.phone.length !== 10) {
      alert('Phone number must be exactly 10 digits!');
      setLoading(false);
      return;
    }

    // Driving licence validation: alphanumeric, max 7 chars
    if (formData.role === 'customer' && formData.licenseNo) {
      if (!/^[A-Za-z0-9]{1,7}$/.test(formData.licenseNo)) {
        alert('Driving licence must be English letters and numbers only (max 7 characters)!');
        setLoading(false);
        return;
      }
    }

    try {
      // Create new user object
      const newUser = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
        address: formData.address,
        companyName: formData.companyName,
        licenseNo: formData.licenseNo
      };

      // Save to database
      const userData = await registerUser(newUser);

      // Save token to localStorage for authenticated requests
      if (userData.token) {
        localStorage.setItem('token', userData.token);
      }

      // Auto login after registration
      login(userData);
      
      alert('Registration Successful!\n\nWelcome to LuxeDrive, ' + userData.name + '!\n\nYou can now login anytime with your email and password.');

      // Redirect based on role
      if (userData.role === 'provider') {
        navigate('/provider/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err) {
      alert('Registration failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container register-container">
        <div className="auth-left">
          <FaCar className="auth-icon" />
          <h2>Join LuxeDrive</h2>
          <p>Create an account to start renting premium vehicles or list your own cars for rental.</p>
        </div>
        <div className="auth-right register-form">
          <h2>Create Account</h2>
          <form onSubmit={handleSubmit}>
            {/* Name and Email */}
            <div className="form-row">
              <div className="form-group">
                <label><FaUser /> Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="form-group">
                <label><FaEnvelope /> Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            {/* Password Fields */}
            <div className="form-row">
              <div className="form-group">
                <label><FaLock /> Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Exactly 8 characters + a number"
                  required
                  maxLength={8}
                  minLength={8}
                />
              </div>
              <div className="form-group">
                <label><FaLock /> Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  required
                />
                {formData.confirmPassword.length > 0 && (
                  <small style={{
                    fontSize: '0.75rem', fontWeight: 700, marginTop: '5px', display: 'block',
                    color: formData.password === formData.confirmPassword ? '#10b981' : '#ef4444'
                  }}>
                    {formData.password === formData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </small>
                )}
              </div>
            </div>

            {/* Role and Phone */}
            <div className="form-row">
              <div className="form-group">
                <label>I want to *</label>
                <select name="role" value={formData.role} onChange={handleChange}>
                  <option value="customer">Rent Vehicles (Customer)</option>
                  <option value="provider">Provide Vehicles (Provider)</option>
                </select>
              </div>
              <div className="form-group">
                <label><FaPhone /> Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0771234567"
                  maxLength={10}
                  inputMode="numeric"
                />
                {formData.phone && formData.phone.length !== 10 && (
                  <small style={{ color: '#ef4444', fontSize: '0.78rem' }}>Phone must be exactly 10 digits</small>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="form-group">
              <label><FaMapMarkerAlt /> Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Your address"
              />
            </div>

            {/* Provider-specific fields */}
            {formData.role === 'provider' && (
              <div className="form-row">
                <div className="form-group">
                  <label><FaBuilding /> Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Your company name"
                  />
                </div>
                <div className="form-group">
                  <label><FaIdCard /> Business License No</label>
                  <input
                    type="text"
                    name="licenseNo"
                    value={formData.licenseNo}
                    onChange={handleChange}
                    placeholder="License number"
                  />
                </div>
              </div>
            )}

            {/* Customer-specific fields */}
            {formData.role === 'customer' && (
              <div className="form-group">
                <label><FaIdCard /> Driving License No</label>
                <input
                  type="text"
                  name="licenseNo"
                  value={formData.licenseNo}
                  onChange={handleChange}
                  placeholder="e.g. AB12345"
                  maxLength={7}
                />
                {formData.licenseNo && !/^[A-Za-z0-9]{1,7}$/.test(formData.licenseNo) && (
                  <small style={{ color: '#ef4444', fontSize: '0.78rem' }}>Only English letters & numbers, max 7 chars</small>
                )}
                <small style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '2px', display: 'block' }}>English letters + numbers only · Max 7 characters</small>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          <p className="auth-switch">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}