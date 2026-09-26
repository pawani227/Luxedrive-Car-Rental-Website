import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { FaCar, FaCalendarCheck, FaClock, FaCheckCircle, FaTimesCircle, FaMapMarkerAlt, FaBell } from 'react-icons/fa';
import CustomerMessages from '../components/CustomerMessages.jsx';
import { getMyBookings, updateBookingStatus } from '../services/bookingService.js';
import { getMyNotifications, markNotificationRead } from '../services/notificationService.js';
import { fetchVehicles } from '../services/vehicleService.js';

// ─── Notification type config ────────────────────────────────────────────────
const NOTICE_CONFIG = {
  vehicle_issue: { bg: '#fef2f2', border: '#ef4444', icon: '🔧', label: 'Vehicle Issue', color: '#dc2626' },
  cancelled:     { bg: '#fef2f2', border: '#dc2626', icon: '🚫', label: 'Booking Notice', color: '#b91c1c' },
  time_change:   { bg: '#fffbeb', border: '#f59e0b', icon: '⏰', label: 'Time Update',   color: '#d97706' },
  ready:         { bg: '#f0fdf4', border: '#10b981', icon: '✅', label: 'Ready',          color: '#059669' },
  general:       { bg: '#eff6ff', border: '#3b82f6', icon: '📢', label: 'Notice',         color: '#2563eb' }
};

// ─── Format time as AM/PM ────────────────────────────────────────────────────
const formatTimeAMPM = (time24) => {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
};

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [delayReports, setDelayReports] = useState([]);
  const [notifications, setNotifications] = useState([]);   // all notifications
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [allVehicles, setAllVehicles] = useState([]);
  const [editingBooking, setEditingBooking] = useState(null); // booking requested for change

  const loadData = useCallback(async () => {
    if (!user?._id) return;
    try {
      const bData = await getMyBookings(user._id);
      setBookings(bData);

      const dRes = await fetch(`http://localhost:5000/api/delays/user/${user.email}`);
      const dData = await dRes.json();
      if (dData.success) {
        setDelayReports(dData.data.filter(r => r.thread && r.thread.length > 0));
      }

      // Load booking notifications
      const nData = await getMyNotifications(user._id);
      setNotifications(nData);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Load all vehicles once
  useEffect(() => {
    const getVehicles = async () => {
      try {
        const vehicles = await fetchVehicles();
        setAllVehicles(vehicles);
      } catch (err) {
        console.error('Failed to load vehicles:', err);
      }
    };
    getVehicles();
  }, []);

  // Group notifications by bookingId
  const notificationsByBooking = notifications.reduce((acc, n) => {
    const key = String(n.bookingId);
    if (!acc[key]) acc[key] = [];
    acc[key].push(n);
    return acc;
  }, {});

  const handleMarkRead = async (notificationId) => {
    try {
      await markNotificationRead(notificationId);
      setNotifications(prev => prev.map(n => n._id === notificationId ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const filteredBookings = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await updateBookingStatus(bookingId, 'cancelled');
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'cancelled' } : b));
    } catch (err) {
      alert('Failed to cancel booking: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking entirely?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, { method: 'DELETE' });
      if (res.ok) {
        setBookings(prev => prev.filter(b => b._id !== bookingId));
      } else {
        alert('Failed to delete booking.');
      }
    } catch (err) {
      alert('Error deleting booking.');
    }
  };

  const handleReportDelay = async (booking) => {
    const reason = window.prompt('Please provide the reason for your delay (and expected return time):');
    if (!reason) return;

    try {
      const res = await fetch('http://localhost:5000/api/delays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking._id,
          customerName: user.name,
          customerEmail: user.email,
          reason: reason,
          vehicleDetails: `${booking.vehicle?.brand} ${booking.vehicle?.model}`
        })
      });
      if (res.ok) {
        alert('Your delay report has been sent to the admin.');
        loadData();
      } else {
        alert('Failed to send delay report.');
      }
    } catch (err) {
      alert('Error sending delay report');
    }
  };

  const handleCustomerReply = async (reportId, text) => {
    if (!text) return;
    try {
      const res = await fetch(`http://localhost:5000/api/delays/${reportId}/reply`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: 'customer', text })
      });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error('Failed to send reply:', err);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending:   { bg: '#fef3c7', color: '#92400e' },
      confirmed: { bg: '#d1fae5', color: '#065f46' },
      completed: { bg: '#dbeafe', color: '#1e40af' },
      rejected:  { bg: '#fee2e2', color: '#991b1b' },
      cancelled: { bg: '#f3f4f6', color: '#6b7280' }
    };
    return colors[status] || { bg: '#f3f4f6', color: '#374151' };
  };

  // Count total unread notifications
  const totalUnread = notifications.filter(n => !n.read).length;

  const stats = [
    { label: 'Total',     value: bookings.length,                                        icon: <FaCalendarCheck />, color: '#6366f1' },
    { label: 'Pending',   value: bookings.filter(b => b.status === 'pending').length,    icon: <FaClock />,          color: '#f59e0b' },
    { label: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length,  icon: <FaCheckCircle />,    color: '#10b981' },
    { label: 'Completed', value: bookings.filter(b => b.status === 'completed').length,  icon: <FaCheckCircle />,    color: '#3b82f6' }
  ];

  const tabs = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

  return (
    <div style={{ paddingBottom: '60px' }}>
      <div className="page-header">
        <h1>Customer Dashboard</h1>
        <p>
          Welcome back, <strong>{user?.name}</strong>! Manage your bookings below.
          {totalUnread > 0 && (
            <span style={{
              marginLeft: '12px', background: '#ef4444', color: 'white',
              borderRadius: '999px', padding: '3px 10px', fontSize: '0.85rem', fontWeight: 700
            }}>
              🔔 {totalUnread} new notice{totalUnread > 1 ? 's' : ''}
            </span>
          )}
        </p>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          {stats.map((s, i) => (
            <div key={i} style={{ background: 'white', padding: '25px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderLeft: `5px solid ${s.color}` }}>
              <div style={{ width: '55px', height: '55px', borderRadius: '14px', background: `linear-gradient(135deg, ${s.color}, ${s.color}dd)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', color: 'white' }}>
                {s.icon}
              </div>
              <div>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', margin: '0 0 5px' }}>{s.value}</h3>
                <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Browse Button */}
        <div style={{ marginBottom: '30px' }}>
          <Link to="/vehicles" className="btn btn-primary">
            <FaCar /> Browse Vehicles to Book
          </Link>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
          {tabs.map((t) => (
            <button
              key={t}
              style={{
                padding: '10px 24px', border: 'none', borderRadius: '999px', cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', fontWeight: 600, textTransform: 'capitalize',
                background: filter === t ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'white',
                color: filter === t ? 'white' : '#64748b', transition: 'all 0.3s'
              }}
              onClick={() => setFilter(t)}
            >
              {t} {t === 'all' ? `(${bookings.length})` : `(${bookings.filter(b => b.status === t).length})`}
            </button>
          ))}
        </div>

        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', marginBottom: '25px' }}>My Bookings</h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
            <p>Loading bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b', background: 'white', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
            <h3 style={{ color: '#1e293b', marginBottom: '10px' }}>
              {filter === 'all' ? 'No bookings yet' : `No ${filter} bookings`}
            </h3>
            <p style={{ marginBottom: '20px' }}>Start by browsing our amazing vehicles!</p>
            <Link to="/vehicles" className="btn btn-primary">Browse Vehicles</Link>
          </div>
        ) : (
          <div>
            {filteredBookings.map((booking) => {
              const statusColor = getStatusColor(booking.status);
              const bookingNotices = notificationsByBooking[String(booking._id)] || [];
              const unreadCount = bookingNotices.filter(n => !n.read).length;

              return (
                <div key={booking._id} style={{ marginBottom: '20px' }}>
                  {/* Booking Card */}
                  <div style={{
                    background: 'white', padding: '20px', borderRadius: unreadCount > 0 ? '16px 16px 0 0' : '16px',
                    display: 'flex', alignItems: 'center', gap: '20px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.06)', flexWrap: 'wrap',
                    borderLeft: unreadCount > 0 ? '5px solid #ef4444' : '5px solid transparent'
                  }}>
                    {/* Vehicle Image + Name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', minWidth: '200px', flex: 1 }}>
                      <div style={{ position: 'relative' }}>
                        <img
                          src={booking.vehicle?.image || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=500&fit=crop'}
                          alt={booking.vehicle?.brand}
                          style={{ width: '100px', height: '70px', objectFit: 'cover', borderRadius: '10px' }}
                        />
                        {unreadCount > 0 && (
                          <span style={{
                            position: 'absolute', top: '-8px', right: '-8px',
                            background: '#ef4444', color: 'white', borderRadius: '50%',
                            width: '22px', height: '22px', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800
                          }}>{unreadCount}</span>
                        )}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', margin: '0 0 5px' }}>
                          {booking.vehicle?.brand} {booking.vehicle?.model}
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'capitalize', margin: 0 }}>
                          {booking.vehicle?.type}
                        </p>
                      </div>
                    </div>

                    {/* Dates */}
                    <div style={{ minWidth: '180px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                        <FaCalendarCheck />
                        <span>{new Date(booking.startDate).toLocaleDateString()} {formatTimeAMPM(booking.pickupTime || '10:00')}</span>
                        <span style={{ margin: '0 5px' }}>→</span>
                        <span>{new Date(booking.endDate).toLocaleDateString()} {formatTimeAMPM(booking.returnTime || '10:00')}</span>
                      </div>
                      {booking.pickupLocation && (
                        <p style={{ fontSize: '0.85rem', color: '#6366f1', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaMapMarkerAlt /> {booking.pickupLocation}
                        </p>
                      )}
                    </div>

                    {/* Price */}
                    <div style={{ textAlign: 'center', minWidth: '120px' }}>
                      <p style={{ fontSize: '1.3rem', fontWeight: 800, color: '#6366f1', margin: '0 0 3px' }}>
                        LKR {booking.totalPrice?.toLocaleString()}
                      </p>
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                        {booking.totalDays} day{booking.totalDays > 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Status & Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', minWidth: '150px' }}>
                      <button
                        onClick={() => handleDeleteBooking(booking._id)}
                        style={{ padding: '4px 10px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.2s', alignSelf: 'flex-end' }}
                        onMouseOver={(e) => e.target.style.background = '#fca5a5'}
                        onMouseOut={(e) => e.target.style.background = '#fee2e2'}
                      >
                        Delete
                      </button>

                      <span style={{ background: statusColor.bg, color: statusColor.color, padding: '6px 14px', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 700, textTransform: 'capitalize' }}>
                        {booking.status}
                      </span>

                      {booking.status === 'pending' && (
                        <button onClick={() => handleCancelBooking(booking._id)} style={{ padding: '8px 16px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s' }} onMouseOver={(e) => e.target.style.background = '#fca5a5'} onMouseOut={(e) => e.target.style.background = '#fee2e2'}>
                          Cancel Booking
                        </button>
                      )}
                      {(booking.status === 'pending' || booking.status === 'confirmed') && (
                        <button onClick={() => handleReportDelay(booking)} style={{ padding: '8px 16px', background: '#fef3c7', color: '#d97706', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s' }} onMouseOver={(e) => e.target.style.background = '#fde68a'} onMouseOut={(e) => e.target.style.background = '#fef3c7'}>
                          Report Delay
                        </button>
                      )}
                      {(booking.status === 'pending' || booking.status === 'confirmed') && booking.changeStatus !== 'pending' && (
                        <button onClick={() => setEditingBooking(booking)} style={{ padding: '8px 16px', background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s' }} onMouseOver={(e) => e.target.style.background = '#dbeafe'} onMouseOut={(e) => e.target.style.background = '#eff6ff'}>
                          Change Vehicle
                        </button>
                      )}
                      {booking.changeStatus === 'pending' && (
                        <span style={{ background: '#fffbeb', color: '#b45309', padding: '6px 12px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, marginTop: '8px', display: 'inline-block', border: '1px solid #fde68a', textAlign: 'right' }}>
                          ⚠️ Pending Change: {booking.proposedVehicle?.brand} {booking.proposedVehicle?.model}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ── Admin Notices for this booking ── */}
                  {bookingNotices.length > 0 && (
                    <div style={{
                      background: '#f8fafc', borderRadius: '0 0 16px 16px',
                      border: '1px solid #e2e8f0', borderTop: 'none',
                      overflow: 'hidden'
                    }}>
                      {bookingNotices.map((notice) => {
                        const cfg = NOTICE_CONFIG[notice.type] || NOTICE_CONFIG.general;
                        return (
                          <div key={notice._id} style={{
                            background: notice.read ? '#f8fafc' : cfg.bg,
                            borderLeft: `4px solid ${notice.read ? '#cbd5e1' : cfg.border}`,
                            padding: '14px 20px',
                            display: 'flex', alignItems: 'flex-start', gap: '14px',
                            opacity: notice.read ? 0.7 : 1,
                            transition: 'all 0.3s'
                          }}>
                            <span style={{ fontSize: '1.3rem', marginTop: '2px' }}>{cfg.icon}</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                  {cfg.label}
                                </span>
                                {!notice.read && (
                                  <span style={{ background: cfg.border, color: 'white', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '999px' }}>NEW</span>
                                )}
                                <span style={{ fontSize: '0.78rem', color: '#94a3b8', marginLeft: 'auto' }}>
                                  {new Date(notice.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <p style={{ margin: '0 0 10px', color: '#1e293b', fontSize: '0.95rem', lineHeight: 1.6, fontWeight: notice.read ? 400 : 500 }}>
                                {notice.message}
                              </p>
                              {!notice.read && (
                                <button
                                  onClick={() => handleMarkRead(notice._id)}
                                  style={{
                                    padding: '5px 14px', background: 'white',
                                    border: `1.5px solid ${cfg.border}`, borderRadius: '8px',
                                    cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                                    color: cfg.color, transition: 'all 0.2s'
                                  }}
                                >
                                  ✓ Mark as Read
                                </button>
                              )}

                              {/* ── Notice Replies Thread ── */}
                              <div style={{ marginTop: '15px', background: '#f1f5f9', padding: '12px 16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {notice.thread && notice.thread.map((msg, i) => (
                                  <div key={i} style={{
                                    background: msg.sender === 'customer' ? '#e0e7ff' : '#ffffff',
                                    padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0',
                                    alignSelf: msg.sender === 'customer' ? 'flex-end' : 'flex-start',
                                    maxWidth: '85%'
                                  }}>
                                    <small style={{ fontWeight: 'bold', color: msg.sender === 'customer' ? '#4f46e5' : '#475569' }}>
                                      {msg.sender === 'customer' ? 'You' : 'Admin'}
                                    </small>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: '#1e293b' }}>{msg.text}</p>
                                  </div>
                                ))}

                                <form onSubmit={async (e) => {
                                  e.preventDefault();
                                  const text = e.target.elements.replyText.value;
                                  if (!text.trim()) return;
                                  try {
                                    const res = await fetch(`http://localhost:5000/api/notifications/${notice._id}/reply`, {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ sender: 'customer', text })
                                    });
                                    if (res.ok) {
                                      loadData();
                                    }
                                  } catch (err) {
                                    console.error('Failed to reply to notice:', err);
                                  }
                                  e.target.reset();
                                }} style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
                                  <input 
                                    name="replyText" 
                                    type="text" 
                                    placeholder="Type a reply to admin..." 
                                    required 
                                    style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} 
                                  />
                                  <button type="submit" style={{ padding: '8px 16px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>Send</button>
                                </form>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Customer Messages & Admin Replies */}
        <div style={{ marginTop: '50px' }}>
          <CustomerMessages />
        </div>

        {/* Delay Reports Section */}
        {delayReports.length > 0 && (
          <div style={{ marginTop: '40px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '20px' }}>My Delay Reports</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {delayReports.map(report => (
                <div key={report._id} style={{ background: 'white', padding: '20px', borderRadius: '12px', borderLeft: report.status === 'resolved' ? '4px solid #10b981' : '4px solid #f59e0b', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <h4 style={{ margin: 0, color: '#1e293b' }}>{report.vehicleDetails}</h4>
                      <small style={{ color: '#64748b' }}>Submitted on: {new Date(report.createdAt).toLocaleDateString()}</small>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', background: report.status === 'resolved' ? '#dcfce3' : '#fef3c7', color: report.status === 'resolved' ? '#166534' : '#b45309', padding: '4px 8px', borderRadius: '4px' }}>
                      {report.status}
                    </span>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', marginBottom: '10px' }}>
                      {report.thread && report.thread.map((msg, i) => (
                        <div key={i} style={{
                          background: msg.sender === 'customer' ? '#e0e7ff' : '#ffffff',
                          padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0',
                          alignSelf: msg.sender === 'customer' ? 'flex-end' : 'flex-start',
                          maxWidth: '90%'
                        }}>
                          <small style={{ fontWeight: 'bold', color: msg.sender === 'customer' ? '#4f46e5' : '#475569' }}>
                            {msg.sender === 'customer' ? 'You' : 'Admin'}
                          </small>
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#1e293b' }}>{msg.text}</p>
                        </div>
                      ))}
                    </div>

                    {report.status === 'pending' && (
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const text = e.target.elements.replyText.value;
                        handleCustomerReply(report._id, text);
                        e.target.reset();
                      }} style={{ display: 'flex', gap: '10px' }}>
                        <input name="replyText" type="text" placeholder="Type a reply..." required style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                        <button type="submit" style={{ padding: '10px 20px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Send</button>
                      </form>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Change Vehicle Selector Modal */}
        {editingBooking && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: '20px'
          }}>
            <div style={{
              background: 'white', borderRadius: '20px', padding: '30px',
              width: '100%', maxWidth: '500px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              maxHeight: '85vh', display: 'flex', flexDirection: 'column'
            }}>
              <h3 style={{ margin: '0 0 10px', fontSize: '1.3rem', fontWeight: 800 }}>Change Vehicle Request</h3>
              <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: '0.9rem' }}>
                Select a replacement vehicle for your booking. The admin must approve this change.
              </p>

              <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', paddingRight: '4px' }}>
                {allVehicles.filter(v => v._id !== editingBooking.vehicleId).map(v => (
                  <div 
                    key={v._id} 
                    style={{
                      display: 'flex', alignItems: 'center', gap: '14px', padding: '12px',
                      borderRadius: '12px', border: '1.5px solid #e2e8f0', cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onClick={async () => {
                      if (!window.confirm(`Request to change your vehicle to ${v.brand} ${v.model}?`)) return;
                      try {
                        const res = await fetch(`http://localhost:5000/api/bookings/${editingBooking._id}/request-change`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ vehicleId: v._id })
                        });
                        const data = await res.json();
                        if (res.ok) {
                          alert('Request submitted! Admin approval is required.');
                          setEditingBooking(null);
                          loadData();
                        } else {
                          alert('Failed to request change: ' + data.message);
                        }
                      } catch (err) {
                        alert('Error submitting change request');
                      }
                    }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = '#6366f1'}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                  >
                    <img src={v.image} alt={v.brand} style={{ width: '80px', height: '55px', objectFit: 'cover', borderRadius: '8px', background: '#f1f5f9' }} />
                    <div style={{ flex: 1 }}>
                      <strong style={{ display: 'block', fontSize: '0.92rem', color: '#0f172a' }}>{v.brand} {v.model}</strong>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{v.type} | LKR {v.pricePerDay?.toLocaleString()}/day</span>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setEditingBooking(null)} 
                style={{ padding: '12px', background: '#f1f5f9', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', color: '#64748b' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}