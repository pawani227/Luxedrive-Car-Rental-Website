import { useState, useEffect } from 'react';
import { FaStar, FaPaperPlane, FaQuoteLeft } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext.jsx';
import { submitFeedback, fetchFeedbacks } from '../services/feedbackService.js';
import './Feedback.css';

export default function Feedback() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);

    // CHANGED: Load feedbacks from DATABASE
  useEffect(() => {
    const loadFeedbacks = async () => {
      try {
        const data = await fetchFeedbacks();
        // Map _id to id for compatibility with existing code
        const mapped = (data.data || []).map(fb => ({
          id: fb._id,
          name: fb.name,
          email: fb.email,
          message: fb.message,
          rating: fb.rating,
          date: new Date(fb.createdAt).toLocaleDateString()
        }));
        setFeedbacks(mapped);
      } catch (err) {
        console.error('Failed to load feedbacks:', err);
      }
    };
    loadFeedbacks();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

    // CHANGED: Save to DATABASE instead of localStorage
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      alert('Please give a star rating!');
      return;
    }

    try {
      // Send to database
      await submitFeedback({
        name: form.name,
        email: form.email,
        rating: Number(rating),
        message: form.message,
        userId: user?._id || ''
      });

      // Reset form
      setForm({ name: '', email: '', message: '' });
      setRating(0);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);

      // Reload feedbacks from database
      const data = await fetchFeedbacks();
      const mapped = (data.data || []).map(fb => ({
        id: fb._id,
        name: fb.name,
        email: fb.email,
        message: fb.message,
        rating: fb.rating,
        date: new Date(fb.createdAt).toLocaleDateString()
      }));
      setFeedbacks(mapped);
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  };
  
  // Average rating
  const avgRating = feedbacks.length > 0
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
    : 0;

  return (
    <div className="feedback-page">
      {/* ===== HERO ===== */}
      <header className="feedback-hero">
        <h1>Customer Feedback</h1>
        <p>We value your opinion! Share your experience with LuxeDrive.</p>
        {feedbacks.length > 0 && (
          <div className="hero-rating">
            <span className="hero-stars">
              {'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}
            </span>
            <span className="hero-avg">{avgRating} / 5</span>
            <span className="hero-count">({feedbacks.length} reviews)</span>
          </div>
        )}
      </header>

      <div className="feedback-container">
        {/* ===== FORM ===== */}
        <section className="feedback-form-section">
          <h2>Share Your <span>Feedback</span></h2>
          <div className="divider" />

          {submitted && (
            <div className="success-msg">
              ✅ Thank you for your feedback!
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-field">
                <label>Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="form-field">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            {/* Star Rating */}
            <div className="form-field">
              <label>Rate Your Experience</label>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className="star"
                    color={star <= (hover || rating) ? '#fbbf24' : '#e2e8f0'}
                    onClick={() => setRating(rating === star ? star - 1 : star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                  />
                ))}
                {rating > 0 && <span className="rating-text">{rating} / 5</span>}
              </div>
            </div>

            <div className="form-field">
              <label>Your Feedback</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Tell us about your experience..."
                rows="4"
                required
              />
            </div>

            <button type="submit" className="feedback-btn">
              Submit Feedback <FaPaperPlane />
            </button>
          </form>
        </section>

        {/* ===== DISPLAYED FEEDBACK ===== */}
        {feedbacks.length > 0 && (
          <section className="feedback-list-section">
            <h2>What Our Customers <span>Say</span></h2>
            <div className="divider" />
            <div className="feedback-list">
              {feedbacks.map((f) => (
                <div key={f.id} className="feedback-card">
                  <div className="feedback-quote"><FaQuoteLeft /></div>
                  <div className="feedback-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        color={star <= f.rating ? '#fbbf24' : '#e2e8f0'}
                        size={16}
                      />
                    ))}
                  </div>
                  <p className="feedback-text">"{f.message}"</p>
                  <div className="feedback-author">
                    <div className="feedback-avatar">{f.name.charAt(0).toUpperCase()}</div>
                    <div>
                      <h4>{f.name}</h4>
                      <span>{f.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}