import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { FaCar, FaGasPump, FaCogs, FaUsers, FaCalendarAlt, FaMapMarkerAlt, FaRoad, FaTachometerAlt, FaTools } from 'react-icons/fa';
import PaymentModal from '../components/PaymentModal.jsx';
import { fetchVehicleById } from '../services/vehicleService.js';
import { createBooking, getVehicleBookings } from '../services/bookingService.js';
import './VehicleDetails.css';

const formatTimeAMPM = (timeStr) => {
  if (!timeStr) return '';
  const [hourStr, minStr] = timeStr.split(':');
  if (!hourStr || !minStr) return timeStr;
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  hour = hour ? hour : 12;
  const paddedHour = String(hour).padStart(2, '0');
  return `${paddedHour}:${minStr} ${ampm}`;
};

// ──────────────── Custom AM/PM Time Picker ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
function TimePicker({ value, onChange, required }) {
  const parse = (v) => {
    const [h, m] = (v || '10:00').split(':').map(Number);
    return { h12: h % 12 || 12, min: m, period: h >= 12 ? 'PM' : 'AM' };
  };
  const { h12, min, period } = parse(value);

  // Local state for typed characters so typing isn't interrupted
  const [hourInput, setHourInput] = useState(String(h12).padStart(2, '0'));
  const [minInput, setMinInput] = useState(String(min).padStart(2, '0'));

  // Sync state if props change
  useEffect(() => {
    const { h12: currentH, min: currentM } = parse(value);
    setHourInput(String(currentH).padStart(2, '0'));
    setMinInput(String(currentM).padStart(2, '0'));
  }, [value]);

  const to24 = (h, m, p) => {
    const h24 = p === 'PM' ? (h % 12) + 12 : h % 12;
    return `${String(h24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const handleHourChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setHourInput(val);
    if (val !== '') {
      let num = Number(val);
      if (num > 12) num = 12;
      if (num < 1) num = 1;
      onChange(to24(num, min, period));
    }
  };

  const handleHourBlur = () => {
    let num = Number(hourInput);
    if (isNaN(num) || num < 1) num = 12;
    if (num > 12) num = 12;
    const formatted = String(num).padStart(2, '0');
    setHourInput(formatted);
    onChange(to24(num, min, period));
  };

  const handleMinChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setMinInput(val);
    if (val !== '') {
      let num = Number(val);
      if (num > 59) num = 59;
      if (num < 0) num = 0;
      onChange(to24(h12, num, period));
    }
  };

  const handleMinBlur = () => {
    let num = Number(minInput);
    if (isNaN(num) || num < 0) num = 0;
    if (num > 59) num = 59;
    const formatted = String(num).padStart(2, '0');
    setMinInput(formatted);
    onChange(to24(h12, num, period));
  };

  const col  = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' };
  const lbl  = { fontSize: '0.62rem', fontWeight: 800, color: '#6366f1', letterSpacing: '0.08em', textTransform: 'uppercase' };
  const inputStyle = {
    border: '1.5px solid #c7d2fe', borderRadius: '8px', padding: '5px 2px',
    fontSize: '0.88rem', fontWeight: 700, color: '#1e293b', background: '#f8fafc',
    textAlign: 'center', outline: 'none', width: '52px', height: '34px', boxSizing: 'border-box'
  };
  const sep  = { fontWeight: 900, color: '#a5b4fc', fontSize: '1rem', paddingTop: '18px' };
  const pill = (active) => ({
    padding: '4px 9px', fontSize: '0.74rem', fontWeight: 800, border: '1.5px solid',
    borderRadius: '7px', cursor: 'pointer', transition: 'all 0.15s',
    background: active ? '#6366f1' : '#f1f5f9',
    color: active ? '#fff' : '#64748b',
    borderColor: active ? '#6366f1' : '#e2e8f0',
    height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center'
  });

  return (
    <div style={{ display: 'inline-flex', alignItems: 'flex-end', gap: '5px' }}>
      <div style={col}>
        <span style={lbl}>Hour</span>
        <input
          type="text"
          maxLength={2}
          style={inputStyle}
          value={hourInput}
          onChange={handleHourChange}
          onBlur={handleHourBlur}
          required={required}
        />
      </div>

      <span style={sep}>:</span>

      <div style={col}>
        <span style={lbl}>Min</span>
        <input
          type="text"
          maxLength={2}
          style={inputStyle}
          value={minInput}
          onChange={handleMinChange}
          onBlur={handleMinBlur}
          required={required}
        />
      </div>

      <div style={{ ...col, gap: '4px' }}>
        <span style={lbl}>Period</span>
        <div style={{ display: 'flex', gap: '3px' }}>
          {['AM', 'PM'].map(p => (
            <button key={p} type="button" style={pill(period === p)}
              onClick={() => onChange(to24(h12, min, p))}>{p}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function VehicleDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [booking, setBooking] = useState({
    startDate: '', pickupTime: '10:00', endDate: '', returnTime: '10:00', estimatedKm: '', pickupLocation: '', dropoffLocation: ''
  });

  const [vehicleBookings, setVehicleBookings] = useState([]);
  const [dateError, setDateError] = useState('');

  const [totalDays, setTotalDays] = useState(0);
  const [basePrice, setBasePrice] = useState(0);
  const [includedKm, setIncludedKm] = useState(0);
  const [extraKm, setExtraKm] = useState(0);
  const [extraKmCost, setExtraKmCost] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  // Load the vehicle and its active bookings from database
  useEffect(() => {
    const loadVehicleData = async () => {
      try {
        const [foundVehicle, bookings] = await Promise.all([
          fetchVehicleById(id),
          getVehicleBookings(id)
        ]);
        if (foundVehicle) {
          setVehicle(foundVehicle);
        }
        const sortedBookings = bookings
          ? [...bookings].sort((a, b) => {
            const dateA = new Date(`${a.startDate}T${a.pickupTime || '00:00'}`);
            const dateB = new Date(`${b.startDate}T${b.pickupTime || '00:00'}`);
            return dateA - dateB;
          })
          : [];
        setVehicleBookings(sortedBookings);
      } catch (err) {
        console.error('Failed to load vehicle details or bookings:', err);
      } finally {
        setLoading(false);
      }
    };
    loadVehicleData();
    const interval = setInterval(loadVehicleData, 4000);
    return () => clearInterval(interval);
  }, [id]);

  // Calculate pricing and check for date overlaps
  useEffect(() => {
    if (!vehicle || !booking.startDate || !booking.endDate) {
      setTotalDays(0); setBasePrice(0); setIncludedKm(0); setExtraKm(0); setExtraKmCost(0); setTotalPrice(0);
      setDateError('');
      return;
    }
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    if (days <= 0) {
      setDateError('Return date must be after pickup date.');
      setTotalDays(0);
      return;
    }

    // Check overlap with active bookings
    const reqStart = new Date(`${booking.startDate}T${booking.pickupTime || '00:00'}`);
    const reqEnd = new Date(`${booking.endDate}T${booking.returnTime || '23:59'}`);

    const hasOverlap = vehicleBookings.some((b) => {
      const bStart = new Date(`${b.startDate}T${b.pickupTime || '00:00'}`);
      const bEnd = new Date(`${b.endDate}T${b.returnTime || '23:59'}`);
      // Overlap logic: reqStart < bEnd AND reqEnd > bStart
      return reqStart < bEnd && reqEnd > bStart;
    });

    if (hasOverlap) {
      setDateError('Selected dates overlap with an existing booking for this vehicle. Please select different dates.');
      setTotalDays(0);
      return;
    }

    setDateError('');
    const totalIncludedKm = days * (vehicle.includedKmPerDay || 100);
    const estimatedKm = Number(booking.estimatedKm) || 0;
    const extraKmDriven = Math.max(0, estimatedKm - totalIncludedKm);
    const extraKmCharge = extraKmDriven * (vehicle.additionalKmPrice || 0);
    const baseRental = days * vehicle.pricePerDay;
    const total = baseRental + extraKmCharge;

    setTotalDays(days);
    setBasePrice(baseRental);
    setIncludedKm(totalIncludedKm);
    setExtraKm(extraKmDriven);
    setExtraKmCost(extraKmCharge);
    setTotalPrice(total);
  }, [vehicle, booking.startDate, booking.endDate, booking.estimatedKm, vehicleBookings]);

  // Step 1: Validate & open payment page
  const handleBooking = (e) => {
    e.preventDefault();
    if (!user) { alert('Please login to book'); navigate('/login'); return; }
    if (user.role !== 'customer') { alert('Only customers can book'); return; }
    if (totalDays <= 0 || dateError) { alert(dateError || 'Please select valid dates'); return; }

    // Open payment model
    setShowPayment(true);
  };

  // Step 2: After payment success, save the booking to MongoDB
  const completeBooking = async () => {
    try {
      const newBooking = {
        customerId: user._id,
        customerName: user.name,
        customerEmail: user.email,
        customerPhone: user.phone || '',
        vehicleId: vehicle._id,
        vehicle: {
          brand: vehicle.brand,
          model: vehicle.model,
          type: vehicle.category || vehicle.type,
          image: vehicle.image,
          pricePerDay: vehicle.pricePerDay,
          additionalKmPrice: vehicle.additionalKmPrice,
          includedKmPerDay: vehicle.includedKmPerDay
        },
        providerId: vehicle.providerId || '',
        providerName: vehicle.providerName || '',
        startDate: booking.startDate,
        pickupTime: booking.pickupTime,
        endDate: booking.endDate,
        returnTime: booking.returnTime,
        pickupLocation: booking.pickupLocation,
        dropoffLocation: booking.dropoffLocation,
        totalDays,
        estimatedKm: Number(booking.estimatedKm) || 0,
        includedKm,
        extraKm,
        extraKmCost,
        basePrice,
        totalPrice,
        status: 'pending',
        paymentStatus: 'paid'
      };

      await createBooking(newBooking);
      setShowPayment(false);
      navigate('/customer/dashboard');
    } catch (err) {
      alert('Booking failed: ' + (err.response?.data?.message || err.message));
      setShowPayment(false);
    }
  };

  if (loading) return <div className="loading"><div className="loading-spinner"></div></div>;

  if (!vehicle) {
    return (
      <div className="vd-notfound">
        <h2>Vehicle not found</h2>
        <Link to="/vehicles" className="btn btn-primary">Back to Vehicles</Link>
      </div>
    );
  }

  const formatFuel = (fuel) => {
    if (fuel === undefined || fuel === null || fuel === '') return null;
    const str = String(fuel).trim();
    if (/^\d+$/.test(str)) return `${str}%`;
    return str;
  };

  const hasCondition = vehicle.fuelLevel || vehicle.odometer || vehicle.lastServiceDate;

  const specs = [
    { icon: <FaCar />, label: 'Type', value: vehicle.category || vehicle.type },
    { icon: <FaUsers />, label: 'Seats', value: vehicle.seats },
    { icon: <FaCogs />, label: 'Trans.', value: vehicle.transmission },
    { icon: <FaGasPump />, label: 'Fuel', value: vehicle.fuelType },
    { icon: <FaCalendarAlt />, label: 'Year', value: vehicle.year }
  ];

  return (
    <div className="vd-page">
      <div className="vd-container">
        <div className="vd-grid">

          {/* LEFT: Vehicle Info */}
          <div>
            <div className="vd-image-box">
              <img
                src={vehicle.image || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=500&fit=crop'}
                alt={vehicle.brand}
              />
            </div>

            <div className="vd-info-card">
              <h1 className="vd-title">{vehicle.brand} {vehicle.model}</h1>
              <p className="vd-year">{vehicle.year}</p>

              {/* Price */}
              <div className="vd-price-box">
                <div className="vd-price-main">
                  <span className="vd-price-amount">LKR {vehicle.pricePerDay?.toLocaleString()}</span>
                  <span className="vd-price-period">/ day</span>
                </div>
                <p>✓ {vehicle.includedKmPerDay || 100} km included per day</p>
                <p>+ LKR {vehicle.additionalKmPrice || 0} per extra km</p>
              </div>

              {/* Specs */}
              <div className="vd-specs">
                {specs.map((s, i) => (
                  <div key={i} className="vd-spec-item">
                    <div className="vd-spec-icon">{s.icon}</div>
                    <div>
                      <span className="vd-spec-label">{s.label}</span>
                      <span className="vd-spec-value">{s.value}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Vehicle Condition */}
              {hasCondition && (
                <div className="vd-section">
                  <h3 className="vd-section-title">Vehicle Condition</h3>
                  <div className="vd-condition-grid">
                    {formatFuel(vehicle.fuelLevel) && (
                      <div className="vd-condition-item vd-cond-fuel">
                        <div className="vd-cond-icon vd-icon-green"><FaGasPump /></div>
                        <div>
                          <span className="vd-spec-label">Fuel Level</span>
                          <span className="vd-spec-value">{formatFuel(vehicle.fuelLevel)}</span>
                        </div>
                      </div>
                    )}
                    {vehicle.odometer && (
                      <div className="vd-condition-item vd-cond-odo">
                        <div className="vd-cond-icon vd-icon-blue"><FaTachometerAlt /></div>
                        <div>
                          <span className="vd-spec-label">Odometer</span>
                          <span className="vd-spec-value">{Number(vehicle.odometer).toLocaleString()} km</span>
                        </div>
                      </div>
                    )}
                    {vehicle.lastServiceDate && (
                      <div className="vd-condition-item vd-cond-service">
                        <div className="vd-cond-icon vd-icon-orange"><FaTools /></div>
                        <div>
                          <span className="vd-spec-label">Last Service</span>
                          <span className="vd-spec-value">{new Date(vehicle.lastServiceDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {vehicle.features && (
                <div className="vd-section">
                  <h3 className="vd-section-title">Features</h3>
                  <p className="vd-text">{vehicle.features}</p>
                </div>
              )}

              {vehicle.description && (
                <div className="vd-section vd-section-last">
                  <h3 className="vd-section-title">Description</h3>
                  <p className="vd-text">{vehicle.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Booking Form */}
          <div>
            <div className="vd-booking-card">
              <h2 className="vd-booking-title">
                <FaCalendarAlt /> Book This Vehicle
              </h2>

              {vehicle.available !== false ? (
                <form onSubmit={handleBooking}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div className="vd-field" style={{ flex: 1 }}>
                      <label>Pickup Date *</label>
                      <input type="date" value={booking.startDate}
                        onChange={(e) => setBooking({ ...booking, startDate: e.target.value })}
                        min={new Date().toISOString().split('T')[0]} required />
                    </div>
                    <div className="vd-field" style={{ width: 'auto' }}>
                      <label style={{ fontSize: '0.78rem', marginBottom: '6px', display: 'block' }}>Pickup Time *</label>
                      <TimePicker
                        value={booking.pickupTime}
                        onChange={val => setBooking({ ...booking, pickupTime: val })}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div className="vd-field" style={{ flex: 1 }}>
                      <label>Return Date *</label>
                      <input type="date" value={booking.endDate}
                        onChange={(e) => setBooking({ ...booking, endDate: e.target.value })}
                        min={booking.startDate || new Date().toISOString().split('T')[0]} required />
                    </div>
                    <div className="vd-field" style={{ width: 'auto' }}>
                      <label style={{ fontSize: '0.78rem', marginBottom: '6px', display: 'block' }}>Return Time *</label>
                      <TimePicker
                        value={booking.returnTime}
                        onChange={val => setBooking({ ...booking, returnTime: val })}
                        required
                      />
                    </div>
                  </div>

                  {dateError && (
                    <div style={{ color: '#ef4444', background: '#fee2e2', padding: '10px 15px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '15px' }}>
                      ⚠️ {dateError}
                    </div>
                  )}

                  {/* List of Booked Dates */}
                  {vehicleBookings.length > 0 && (
                    <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px dashed #cbd5e1', marginBottom: '15px' }}>
                      <h5 style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '0.85rem', fontWeight: 700 }}>
                        🚫 Already Booked Dates:
                      </h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        {vehicleBookings.map((b, idx) => (
                          <div key={idx} style={{ fontSize: '0.8rem', color: '#1e293b', background: '#eef2ff', padding: '4px 10px', borderRadius: '6px', fontWeight: 600, width: 'fit-content' }}>
                            📅 {new Date(b.startDate).toLocaleDateString()} {formatTimeAMPM(b.pickupTime || '00:00')} to {new Date(b.endDate).toLocaleDateString()} {formatTimeAMPM(b.returnTime || '23:59')}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="vd-field">
                    <label><FaRoad className="vd-label-icon" /> Estimated Total KM</label>
                    <input type="number" value={booking.estimatedKm}
                      onChange={(e) => setBooking({ ...booking, estimatedKm: e.target.value })}
                      placeholder={`e.g., ${(vehicle.includedKmPerDay || 100) * 3}`} min="0" />
                    <p className="vd-field-hint">
                      {vehicle.includedKmPerDay || 100} km free/day. Extra: LKR {vehicle.additionalKmPrice || 0}/km
                    </p>
                  </div>

                  <div className="vd-field">
                    <label><FaMapMarkerAlt className="vd-label-icon" /> Pickup Location</label>
                    <input type="text" value={booking.pickupLocation}
                      onChange={(e) => setBooking({ ...booking, pickupLocation: e.target.value })}
                      placeholder="e.g., Colombo" required />
                  </div>

                  <div className="vd-field">
                    <label><FaMapMarkerAlt className="vd-label-icon" /> Dropoff Location</label>
                    <input type="text" value={booking.dropoffLocation}
                      onChange={(e) => setBooking({ ...booking, dropoffLocation: e.target.value })}
                      placeholder="e.g., Galle" required />
                  </div>

                  {totalDays > 0 && !dateError && (
                    <div className="vd-breakdown">
                      <h4>Price Breakdown</h4>
                      <div className="vd-break-row">
                        <span>Rental ({totalDays} day{totalDays > 1 ? 's' : ''})</span>
                        <span>LKR {basePrice.toLocaleString()}</span>
                      </div>
                      <div className="vd-break-row vd-break-free">
                        <span>Free km ({includedKm} km)</span>
                        <span>FREE</span>
                      </div>
                      {extraKm > 0 && (
                        <div className="vd-break-row">
                          <span>Extra km ({extraKm} km)</span>
                          <span>LKR {extraKmCost.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="vd-break-total">
                        <span>Total</span>
                        <span>LKR {totalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary btn-full vd-confirm-btn" disabled={!!dateError || totalDays <= 0}>
                    Confirm Booking
                  </button>
                </form>
              ) : (
                <div className="vd-unavailable">
                  <p>This vehicle is not available</p>
                  <Link to="/vehicles" className="btn btn-primary">Browse Other Vehicles</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal
          amount={totalPrice}
          onSuccess={completeBooking}
          onClose={() => setShowPayment(false)}
        />
      )}
    </div>
  );
}