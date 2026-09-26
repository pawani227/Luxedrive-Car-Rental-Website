import { Link } from 'react-router-dom';
import {
  FaCar, FaShieldAlt, FaHeadset, FaMoneyBillWave, FaStar,
  FaBuilding, FaAward, FaHandshake, FaQuoteLeft
} from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { fetchFeedbacks } from '../services/feedbackService.js';
import './AboutUs.css';

export default function AboutUs() {
    // Load customer feedback from database
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeedbacks = async () => {
      try {
        const data = await fetchFeedbacks(10); // Latest 10 reviews
        setFeedbacks(data.data || []);
      } catch (err) {
        console.error('Failed to load feedbacks:', err);
      } finally {
        setLoading(false);
      }
    };
    loadFeedbacks();
  }, []);

  return (
    <div className="about-page">
      {/* ===== PAGE HEADER ===== */}
      <header className="about-hero">
        <h1>About LuxeDrive</h1>
        <p>Your trusted partner for premium car rentals since 2020</p>
      </header>

      {/* ===== OUR STORY ===== */}
      <section className="story-section">
        <div className="container-about">
          <div className="story-grid">
            <div className="story-content">
              <h2>Our <span>Story</span></h2>
              <div className="divider" />
              <p>
                LuxeDrive, founded in 2020, provides premium vehicles at
                affordable prices with excellent customer service. From a fleet
                of just 10 cars, it has grown to 500+ vehicles, serving thousands
                of customers across Sri Lanka.
              </p>
              <p>
                Whether for business, family trips, vacations, or daily
                commuting, LuxeDrive offers reliable vehicles to make every
                journey memorable.
              </p>
              <div className="stats-row">
                <div className="stat-item">
                  <h3>500+</h3>
                  <p>Vehicles</p>
                </div>
                <div className="stat-item">
                  <h3>1000+</h3>
                  <p>Happy Customers</p>
                </div>
                <div className="stat-item">
                  <h3>50+</h3>
                  <p>Trusted Providers</p>
                </div>
              </div>
            </div>

            <div className="story-image">
              <img
                src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop"
                alt="Luxury car fleet"
              />
              <div className="story-image-overlay">
                <h3>Premium Fleet</h3>
                <p>Quality vehicles you can trust</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MISSION / VISION / VALUES ===== */}
      <section className="mission-section">
        <div className="container-about">
          <div className="mission-grid">
            <div className="mission-card">
              <div className="mission-icon"><FaAward /></div>
              <h3>Our Mission</h3>
              <p>
                To provide premium, well-maintained vehicles at competitive prices
                while delivering exceptional customer service that exceeds
                expectations.
              </p>
            </div>
            <div className="mission-card">
              <div className="mission-icon"><FaHandshake /></div>
              <h3>Our Vision</h3>
              <p>
                To become the most trusted and preferred car rental service in
                Sri Lanka, known for quality, reliability, and innovation.
              </p>
            </div>
            <div className="mission-card">
              <div className="mission-icon"><FaStar /></div>
              <h3>Our Values</h3>
              <p>
                Integrity, transparency, and customer satisfaction are at the core
                of everything we do. Your trust is our greatest achievement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section className="features-section">
        <div className="container-about">
          <h2 className="section-title">Why Choose LuxeDrive</h2>
          <p className="section-subtitle">What makes us different from the rest</p>
          <div className="features-grid-about">
            {[
              { icon: <FaCar />, title: 'Premium Fleet', desc: 'All our vehicles are regularly serviced and maintained to the highest standards.' },
              { icon: <FaMoneyBillWave />, title: 'Best Price Guarantee', desc: 'We offer competitive rates with no hidden fees. What you see is what you pay.' },
              { icon: <FaShieldAlt />, title: 'Fully Insured', desc: 'Every rental comes with comprehensive insurance for your peace of mind.' },
              { icon: <FaHeadset />, title: '24/7 Support', desc: 'Our support team is available round-the-clock to help you anytime, anywhere.' },
              { icon: <FaStar />, title: 'Top Rated Service', desc: 'Rated 4.9/5 by our customers. We pride ourselves on exceptional service.' },
              { icon: <FaBuilding />, title: 'Multiple Locations', desc: 'Convenient pickup and dropoff locations across Colombo, Kandy, Galle and more.' }
            ].map((f, i) => (
              <div key={i} className="feature-card-about">
                <div className="feature-icon-box">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

            {/* ===== TESTIMONIALS - DYNAMIC FROM DATABASE ===== */}
      <section className="testimonials-section">
        <div className="container-about">
          <h2 className="section-title white">What Our Customers Say</h2>
          <p className="section-subtitle white">Trusted by thousands of happy customers</p>
          
          {loading ? (
            <p style={{ color: '#cbd5e1', textAlign: 'center', padding: '40px' }}>
              Loading reviews...
            </p>
          ) : feedbacks.length === 0 ? (
            <p style={{ color: '#cbd5e1', textAlign: 'center', padding: '40px' }}>
              No customer reviews yet. Be the first to share your experience!
            </p>
          ) : (
            <div className="testimonials-grid">
              {feedbacks.map((fb) => (
                <div key={fb._id} className="testimonial-card">
                  <div className="quote-icon"><FaQuoteLeft /></div>
                  <p className="testimonial-text">"{fb.message}"</p>
                  <div className="testimonial-author">
                    <div className="testimonial-avatar">
                      {fb.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="testimonial-author-info">
                      <h4>{fb.name}</h4>
                      <p>
                        {new Date(fb.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="testimonial-stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          color={star <= fb.rating ? '#fbbf24' : '#475569'}
                          size={16}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* ===== CONTACT ===== */}
      <section className="contact-section">
        <div className="container-about">
          <h2>Get In Touch</h2>
          <p className="contact-subtitle">
            Have questions? We'd love to hear from you. Reach out to us anytime.
          </p>
          <div className="contact-grid">
            <div className="contact-card">
              <h3>📍 Location</h3>
              <p>Colombo, Sri Lanka</p>
            </div>
            <div className="contact-card">
              <h3>📞 Phone</h3>
              <p>+94 11 234 5678</p>
            </div>
            <div className="contact-card">
              <h3>✉️ Email</h3>
              <p>info@luxedrive.lk</p>
            </div>
          </div>
          <Link to="/vehicles" className="contact-btn">
            Browse Our Vehicles <FaCar />
          </Link>
        </div>
      </section>
    </div>
  );
}