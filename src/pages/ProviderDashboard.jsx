import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { FaCar, FaPlus, FaEdit, FaTrash, FaEye, FaCalendarCheck, FaCheckCircle, FaMoneyBillWave, FaUsers } from 'react-icons/fa';
import VehicleCard from '../components/VehicleCard.jsx';
import { fetchVehicles, deleteVehicle } from '../services/vehicleService.js';
import { getProviderBookings } from '../services/bookingService.js';

export default function ProviderDashboard() {
  // Provider dashboard shows the vehicles they own and their bookings.
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState('vehicles');

  const loadVehicles = useCallback(async () => {
    try {
      const all = await fetchVehicles();
      setVehicles(all.filter(v => v.providerId === user?._id || v.providerEmail === user?.email));
    } catch (err) {
      console.error('Failed to load provider vehicles:', err);
    }
  }, [user]);


  const loadBookings = useCallback(async () => {
    if (!user?._id) return;
    try {
      const data = await getProviderBookings(user._id);
      setBookings(data);
    } catch (err) {
      console.error('Failed to load provider bookings:', err);
    }
  }, [user]);

  useEffect(() => {
    loadVehicles();
    const iv1 = setInterval(loadVehicles, 5000);
    return () => clearInterval(iv1);
  }, [loadVehicles]);

  useEffect(() => {
    loadBookings();
    const iv2 = setInterval(loadBookings, 5000);
    return () => clearInterval(iv2);
  }, [loadBookings]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vehicle?')) return;
    try {
      await deleteVehicle(id);
      alert('Deleted!');
      loadVehicles();
    } catch (err) {
      alert('Failed to delete vehicle: ' + err.message);
    }
  };

  const stats = [
    { label: 'Total Vehicles', value: vehicles.length, icon: <FaCar />, color: '#6366f1' },
    { label: 'Available', value: vehicles.filter(v => v.available !== false).length, icon: <FaCheckCircle />, color: '#10b981' },
    { label: 'Total Bookings', value: bookings.length, icon: <FaCalendarCheck />, color: '#f59e0b' },
    { label: 'Revenue', value: 'LKR ' + (bookings.filter(b => b.status === 'completed').reduce((s, b) => s + b.totalPrice, 0) / 1000).toFixed(0) + 'K', icon: <FaMoneyBillWave />, color: '#ec4899' }
  ];

  const statCardStyle = (color) => ({
    background: 'white',
    padding: '22px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
    borderLeft: `5px solid ${color}`
  });

  const statIconStyle = (color) => ({
    width: '50px',
    height: '50px',
    borderRadius: '12px',
    background: `linear-gradient(135deg, ${color}, ${color}dd)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '1.4rem'
  });

  const containerStyle = {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 20px'
  };

  const tabBtnStyle = (active) => ({
    padding: '10px 24px',
    border: 'none',
    borderRadius: '999px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 600,
    background: active ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'white',
    color: active ? 'white' : '#64748b',
  });

  const bookingCardStyle = {
    background: 'white',
    padding: '18px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    marginBottom: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
    flexWrap: 'wrap'
  };

  return (
    <div style={{ paddingBottom: '10px' }}>
      <div className="page-header">
        <h1>Provider Dashboard</h1>
        <p>Welcome, <strong>{user?.name}</strong>! Manage your vehicles and bookings.</p>
      </div>

      <div style={containerStyle}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          {stats.map((s, i) => (
            <div key={i} style={statCardStyle(s.color)}>
              <div style={statIconStyle(s.color)}>{s.icon}</div>
              <div>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', margin: '0 0 4px' }}>{s.value}</h3>
                <p style={{ color: '#64748b', margin: 0, fontSize: '0.85rem' }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Add Vehicle Button */}
        <div style={{ marginBottom: '25px' }}>
          <Link to="/provider/add-vehicle" className="btn btn-primary">
            <FaPlus /> Add New Vehicle
          </Link>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '25px' }}>
          <button style={tabBtnStyle(tab === 'vehicles')} onClick={() => setTab('vehicles')}>
            My Vehicles ({vehicles.length})
          </button>
          <button style={tabBtnStyle(tab === 'bookings')} onClick={() => setTab('bookings')}>
            Bookings ({bookings.length})
          </button>
        </div>

        {/* Vehicles Tab */}
        {tab === 'vehicles' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '20px' }}>My Vehicles</h2>
            {vehicles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px' }}>
                <FaCar style={{ fontSize: '3rem', color: '#6366f1', marginBottom: '15px' }} />
                <h3 style={{ color: '#1e293b', marginBottom: '10px' }}>No vehicles yet</h3>
                <p style={{ color: '#64748b', marginBottom: '20px' }}>Start earning by listing your first vehicle!</p>
                <Link to="/provider/add-vehicle" className="btn btn-primary"><FaPlus /> Add Your First Vehicle</Link>
              </div>
            ) : (
              <div className="vehicles-grid">
                {vehicles.map((v) => (
                  <div key={v._id} style={{ position: 'relative' }}>
                    <VehicleCard vehicle={v} />
                    <div style={{ display: 'flex', gap: '8px', padding: '12px', background: 'white', borderRadius: '0 0 20px 20px', marginTop: '-20px', borderTop: '2px solid #f1f5f9' }}>
                      <Link to={`/vehicles/${v._id}`} className="btn btn-sm btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem' }}>
                        <FaEye /> View
                      </Link>
                      <Link to={`/provider/edit-vehicle/${v._id}`} className="btn btn-sm btn-success" style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem' }}>
                        <FaEdit /> Edit
                      </Link>
                      <button onClick={() => handleDelete(v._id)} className="btn btn-sm btn-danger" style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem' }}>
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {tab === 'bookings' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '20px' }}>Vehicle Bookings</h2>
            {bookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px' }}>
                <FaCalendarCheck style={{ fontSize: '3rem', color: '#f59e0b', marginBottom: '15px' }} />
                <h3 style={{ color: '#1e293b', marginBottom: '10px' }}>No bookings yet</h3>
                <p style={{ color: '#64748b' }}>Bookings appear here when customers rent your vehicles</p>
              </div>
            ) : (
              bookings.map((b) => {
                const statusColors = {
                  pending: { bg: '#fef3c7', color: '#92400e' },
                  confirmed: { bg: '#d1fae5', color: '#065f46' },
                  completed: { bg: '#dbeafe', color: '#1e40af' },
                  rejected: { bg: '#fee2e2', color: '#991b1b' },
                  cancelled: { bg: '#f3f4f6', color: '#6b7280' }
                };
                const sc = statusColors[b.status] || { bg: '#f3f4f6', color: '#6b7280' };
                return (
                  <div key={b._id} style={bookingCardStyle}>
                    <img src={b.vehicle?.image || ''} alt={b.vehicle?.brand} style={{ width: '70px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} />
                    <div style={{ flex: 1, minWidth: '150px' }}>
                      <strong style={{ color: '#1e293b' }}>{b.vehicle?.brand} {b.vehicle?.model}</strong>
                      <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '3px 0 0' }}>By: {b.customerName} | {b.customerEmail}</p>
                    </div>
                    <div style={{ textAlign: 'center', minWidth: '100px' }}>
                      <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 3px' }}>{new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}</p>
                      <p style={{ fontSize: '0.85rem', color: '#6366f1', fontWeight: 600, margin: 0 }}>{b.totalDays} day{b.totalDays > 1 ? 's' : ''}</p>
                    </div>
                    <div style={{ textAlign: 'center', minWidth: '100px' }}>
                      <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#6366f1', margin: '0 0 3px' }}>LKR {b.totalPrice?.toLocaleString()}</p>
                    </div>
                    <span style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', background: sc.bg, color: sc.color }}>
                      {b.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}