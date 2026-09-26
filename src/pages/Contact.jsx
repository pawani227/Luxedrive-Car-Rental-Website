import { useState } from 'react';
import {
  FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock,
  FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn, FaPaperPlane
} from 'react-icons/fa';
import './Contact.css';

const API = 'http://localhost:5000/api/messages';

export default function Contact() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', subject: '', message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Form submit - sends to MongoDB database via backend API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to send');

      setSubmitted(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      alert('Failed to send message. Please make sure the server is running.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="contact-page">
      {/* ===== HERO ===== */}
      <header className="contact-hero">
        <h1>Contact Us</h1>
        <p>We're here to help. Reach out and we'll respond as soon as we can.</p>
      </header>

      {/* ===== INFO CARDS ===== */}
      <section className="info-section">
        <div className="container-contact">
          <div className="info-grid">
            <div className="info-card">
              <div className="info-icon"><FaMapMarkerAlt /></div>
              <h3>Our Location</h3>
              <p>123 Galle Road,<br />Colombo, Sri Lanka</p>
            </div>
            <div className="info-card">
              <div className="info-icon"><FaPhoneAlt /></div>
              <h3>Phone Number</h3>
              <p>+94 11 234 5678<br />+94 77 123 4567</p>
            </div>
            <div className="info-card">
              <div className="info-icon"><FaEnvelope /></div>
              <h3>Email Address</h3>
              <p>info@luxedrive.lk<br />support@luxedrive.lk</p>
            </div>
            <div className="info-card">
              <div className="info-icon"><FaClock /></div>
              <h3>Working Hours</h3>
              <p>Mon - Sat: 8AM - 8PM<br />Sunday: 9AM - 5PM</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FORM + MAP ===== */}
      <section className="form-section">
        <div className="container-contact">
          <div className="form-grid">
            {/* Form */}
            <div className="form-box">
              <h2>Send Us a <span>Message</span></h2>
              <div className="divider" />
              <p className="form-intro">
                Fill out the form below and our team will get back to you within 24 hours.
              </p>

              {submitted && (
                <div className="success-msg">
                  ✅ Thank you! Your message has been sent successfully.
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-field">
                    <label>Full Name</label>
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

                <div className="form-row">
                  <div className="form-field">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+94 77 123 4567"
                    />
                  </div>
                  <div className="form-field">
                    <label>Subject</label>
                    <input
                      type="text"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      placeholder="How can we help?"
                      required
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>Message</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Write your message here..."
                    rows="5"
                    required
                  />
                </div>

                <button type="submit" className="submit-btn" disabled={sending}>
                  {sending ? 'Sending...' : 'Send Message'} <FaPaperPlane />
                </button>
              </form>
            </div>

            {/* Map + Social */}
            <div className="map-box">
              <div className="map-wrapper">
                <iframe
                  title="LuxeDrive Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126743.45932!2d79.8211859!3d6.9270786!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae253d10f7a7003%3A0x320b2e4d32d3838d!2sColombo!5e0!3m2!1sen!2slk!4v1700000000000"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <div className="social-box">
                <h3>Follow Us</h3>
                <p>Stay connected on social media for offers & updates.</p>
                <div className="social-icons">
                  <a href="#" aria-label="Facebook"><FaFacebookF /></a>
                  <a href="#" aria-label="Instagram"><FaInstagram /></a>
                  <a href="#" aria-label="Twitter"><FaTwitter /></a>
                  <a href="#" aria-label="LinkedIn"><FaLinkedinIn /></a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="faq-section">
        <div className="container-contact">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-subtitle">Quick answers to common questions</p>
          <div className="faq-grid">
            {[
              { q: 'How do I book a vehicle?', a: 'Simply browse our vehicles, select your preferred car, choose your dates, and complete the booking online in minutes.' },
              { q: 'What documents do I need?', a: 'You need a valid driving license, NIC or passport, and a credit/debit card for the security deposit.' },
              { q: 'Is insurance included?', a: 'Yes, all our rentals come with comprehensive insurance coverage for your peace of mind.' },
              { q: 'Can I cancel my booking?', a: 'Yes, you can cancel free of charge up to 24 hours before your scheduled pickup time.' },
              { q: 'Is there a daily mileage limit?', a: 'Most of our vehicles come with 100km free mileage per day. Any additional mileage is charged at a standard rate.' },
              { q: 'Do you offer airport pickup?', a: 'Yes! We provide convenient airport pickup and drop-off services upon request.' }
            ].map((item, i) => (
              <div key={i} className="faq-card">
                <h3>{item.q}</h3>
                <p>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}