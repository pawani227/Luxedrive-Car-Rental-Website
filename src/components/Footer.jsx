import { Link } from 'react-router-dom';
import { FaCar, FaEnvelope, FaPhone, FaMapMarkerAlt, FaArrowRight } from 'react-icons/fa';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3><FaCar /> LuxeDrive</h3>
          <p>Your trusted partner for premium vehicle rentals. Experience luxury and comfort on every journey.</p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/vehicles">Vehicles</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Contact Us</h4>
          <p><FaMapMarkerAlt /> Colombo, Sri Lanka</p>
          <p><FaPhone /> +94 11 234 5678</p>
          <p><FaEnvelope /> info@luxedrive.lk</p>
        </div>
        <div className="footer-section">
          <h4>Newsletter</h4>
          <p>Subscribe for exclusive offers</p>
          <div className="newsletter-form">
            <input type="email" placeholder="Your email" />
            <button><FaArrowRight /></button>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 LuxeDrive Premium Car Rentals. All rights reserved.</p>
      </div>
    </footer>
  );
}
