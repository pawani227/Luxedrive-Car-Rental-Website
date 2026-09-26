import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { FaCar, FaShieldAlt, FaHeadset, FaMoneyBillWave, FaArrowRight } from 'react-icons/fa';
import { useState } from 'react';
import { fetchVehicles } from '../services/vehicleService.js';


export default function Home() {
  // Home page shows the main landing section and featured vehicles.
  const { user } = useAuth();
  const navigate = useNavigate();

    // ✅ Load featured vehicles from database
  const [featuredVehicles, setFeaturedVehicles] = useState([]);

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const data = await fetchVehicles();
        // Latest 4 vehicles for featured section
        setFeaturedVehicles((data || []).slice(0, 4));
      } catch (err) {
        console.error('Failed to load vehicles:', err);
        setFeaturedVehicles([]);
      }
    };
    loadVehicles();
  }, []);



  const s = {
    // Hero
    hero: {
      minHeight: '65vh',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      background: '#0f172a'
    },
    heroBg: {
      position: 'absolute',
      inset: 0,
      backgroundImage: 'url(https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&h=1080&fit=crop)',
      backgroundSize: 'cover',
      backgroundPosition: 'center right',
      zIndex: 0
    },
    heroOverlay: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(90deg, rgba(15,23,42,0.97) 0%, rgba(15,23,42,0.88) 35%, rgba(15,23,42,0.55) 65%, rgba(79,70,229,0.35) 100%)',
      zIndex: 0
    },
    heroContent: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '0 20px',
      color: 'white',
      position: 'relative',
      zIndex: 2,
      width: '100%'
    },
    heroH1: { fontSize: '3.5rem', fontWeight: 900, marginBottom: '20px', lineHeight: '1.2' },
    heroP: { fontSize: '1.25rem', color: '#e0e7ff', maxWidth: '600px', marginBottom: '30px', lineHeight: '1.8' },
    heroBtns: { display: 'flex', gap: '15px', marginBottom: '50px', flexWrap: 'wrap' },
    heroStats: { display: 'flex', gap: '50px', flexWrap: 'wrap' },
    statNum: { fontSize: '2.5rem', color: '#fbbf24', fontWeight: 800, marginBottom: '8px' },
    statLabel: { color: '#cbd5e1', fontSize: '1rem' },

    // Sections
    section: { padding: '15px 0' },
    container: { maxWidth: '1400px', margin: '0 auto', padding: '0 20px' },
    sectionTitle: { textAlign: 'center', fontSize: '2.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '10px' },
    sectionSub: { textAlign: 'center', color: '#64748b', fontSize: '1.15rem', marginBottom: '15px' },

    // Features grid
    featuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '30px' },
    featureCard: { textAlign: 'center', padding: '45px 35px', borderRadius: '20px', background: 'linear-gradient(135deg, #f8fafc, #eef2ff)', transition: 'all 0.4s', cursor: 'pointer', border: '2px solid transparent' },
    featureIconBox: { width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px', fontSize: '2rem', boxShadow: '0 8px 25px rgba(99,102,241,0.3)' },
    featureTitle: { fontSize: '1.3rem', fontWeight: 700, color: '#1e293b', marginBottom: '12px' },
    featureDesc: { color: '#64748b', fontSize: '0.95rem', lineHeight: '1.7' },

    // Vehicle grid
    vehicleGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' },
    vehicleCard: { background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', transition: 'all 0.3s', textDecoration: 'none' },
    vehicleImg: { width: '100%', height: '224px', objectFit: 'cover' },
    vehicleBody: { padding: '20px' },
    vehicleName: { fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', marginBottom: '5px' },
    vehicleYear: { color: '#64748b', fontSize: '0.9rem', marginBottom: '15px' },
    vehicleFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '15px', borderTop: '2px solid #f1f5f9' },
    priceAmount: { fontSize: '1.4rem', fontWeight: 800, color: '#6366f1' },
    pricePeriod: { fontSize: '0.85rem', color: '#94a3b8' },

    // Steps
    stepsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px' },
    stepCard: { textAlign: 'center', padding: '10px 20px' },
    stepNum: { width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px', fontSize: '2rem', fontWeight: 800, boxShadow: '0 8px 25px rgba(99,102,241,0.3)' },

    // CTA
    ctaSection: { padding: '10px 0', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', textAlign: 'center', color: 'white' },
    ctaTitle: { fontSize: '2.4rem', fontWeight: 800, marginBottom: '15px' },
    ctaText: { fontSize: '1.2rem', marginBottom: '30px', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' },
    ctaBtns: { display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }
  };

  return (
    <div>
      {/* HERO */}
      <section style={s.hero}>
        <div style={s.heroBg}></div>
        <div style={s.heroOverlay}></div>
        <div style={s.heroContent}>
          <h1 style={s.heroH1}>
            Find Your Perfect <span style={{ background: 'linear-gradient(135deg, #fbbf24, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Rental Car</span>
          </h1>
          <p style={s.heroP}>Browse through our premium selection of vehicles and book your dream car today. Experience luxury, comfort, and reliability.</p>
          <div style={s.heroBtns}>
            <Link to="/vehicles" className="btn btn-primary" style={{ padding: '16px 36px', fontSize: '1.05rem' }}>
              <FaCar /> Browse Vehicles
            </Link>
            {!user && (
              <Link to="/register" className="btn btn-outline" style={{ padding: '14px 34px', fontSize: '1.05rem' }}>
                Get Started <FaArrowRight />
              </Link>
            )}
          </div>
          <div style={s.heroStats}>
            {[{ num: '500+', label: 'Vehicles' }, { num: '1000+', label: 'Happy Customers' }, { num: '24/7', label: 'Support' }].map((st, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <h3 style={s.statNum}>{st.num}</h3>
                <p style={s.statLabel}>{st.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ ...s.section, background: 'white' }}>
        <div style={s.container}>
          <h2 style={s.sectionTitle}>Why Choose LuxeDrive?</h2>
          <p style={s.sectionSub}>Premium features for an exceptional rental experience</p>
          <div style={s.featuresGrid}>
            {[
              { icon: <FaCar />, title: 'Wide Selection', desc: 'Choose from hundreds of premium vehicles' },
              { icon: <FaMoneyBillWave />, title: 'Best Prices', desc: 'Competitive rates with no hidden fees' },
              { icon: <FaShieldAlt />, title: 'Secure Booking', desc: 'Safe and reliable reservation system' },
              { icon: <FaHeadset />, title: '24/7 Support', desc: 'Round-the-clock customer assistance' }
            ].map((f, i) => (
              <div key={i} style={s.featureCard}>
                <div style={s.featureIconBox}>{f.icon}</div>
                <h3 style={s.featureTitle}>{f.title}</h3>
                <p style={s.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED VEHICLES */}
      <section style={{ ...s.section, background: 'linear-gradient(135deg, #f8fafc, #eef2ff)' }}>
        <div style={s.container}>
          <h2 style={s.sectionTitle}>Featured Vehicles</h2>
          <p style={s.sectionSub}>Explore our handpicked premium collection</p>
          <div style={s.vehicleGrid}>
            {featuredVehicles.map((v) => (
              <Link key={v._id} to={`/vehicles/${v._id}`} style={s.vehicleCard}>
                <img src={v.image} alt={v.brand} style={s.vehicleImg} />
                <div style={s.vehicleBody}>
                  <h3 style={s.vehicleName}>{v.brand} {v.model}</h3>
                  <p style={s.vehicleYear}>{v.year} | {v.category || v.type}</p>
                  <div style={s.vehicleFooter}>
                    <div>
                      <span style={s.priceAmount}>LKR {v.pricePerDay.toLocaleString()}</span>
                      <span style={s.pricePeriod}>/day</span>
                    </div>
                    <span className="btn btn-primary btn-sm">View Details</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Link to="/vehicles" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '1.05rem' }}>
              View All Vehicles <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ ...s.section, background: 'white' }}>
        <div style={s.container}>
          <h2 style={s.sectionTitle}>How It Works</h2>
          <p style={s.sectionSub}>Simple steps to get on the road</p>
          <div style={s.stepsGrid}>
            {[
              { num: '1', title: 'Search & Browse', desc: 'Find the perfect vehicle for your needs' },
              { num: '2', title: 'Book Online', desc: 'Reserve with just a few clicks' },
              { num: '3', title: 'Pick Up & Drive', desc: 'Collect your car and hit the road' }
            ].map((st, i) => (
              <div key={i} style={s.stepCard}>
                <div style={s.stepNum}>{st.num}</div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>{st.title}</h3>
                <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.7' }}>{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section style={s.ctaSection}>
          <div style={s.container}>
            <h2 style={s.ctaTitle}>Ready to Hit the Road?</h2>
            <p style={s.ctaText}>Join thousands of happy customers and experience the LuxeDrive difference today.</p>
            <div style={s.ctaBtns}>
              <Link to="/register" className="btn btn-primary" style={{ padding: '6px 28px', fontSize: '1.05rem', background: 'white', color: '#6366f1' }}>
                Register Now <FaArrowRight />
              </Link>
              <Link to="/vehicles" className="btn btn-outline" style={{ padding: '14px 34px', fontSize: '1.05rem' }}>
                Browse Cars
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}