import { useState, useEffect, useCallback } from 'react';
import { FaCheck, FaTimes, FaFilter, FaCalendarCheck, FaSpinner, FaBell } from 'react-icons/fa';
import { getAllBookings, updateBookingStatus, deleteBooking } from '../services/bookingService.js';
import { sendNotification } from '../services/notificationService.js';
import './ManageBookings.css';

// ─── Quick-fill message templates ───────────────────────────────────────────
const TEMPLATES = {
  vehicle_issue: [
    "Don't come. The vehicle has a technical issue. Please book another vehicle.",
    "The vehicle has a flat tire. Please come at a later time or book another vehicle.",
    "The vehicle requires urgent maintenance. Please book an alternative vehicle.",
    "The vehicle's engine has a fault. We sincerely apologise — please select another vehicle."
  ],
  cancelled: [
    "Don't come. Your booking has been cancelled. Please book another vehicle.",
    "Your reservation has been cancelled due to unforeseen circumstances. Please rebook."
  ],
  time_change: [
    "Please come at the scheduled pickup time. Do not arrive late.",
    "Your pickup time has been adjusted. Please confirm with our team before arriving.",
    "Please arrive 30 minutes earlier than your booked pickup time."
  ],
  ready: [
    "Your vehicle is ready and waiting for you. Please arrive at your scheduled time.",
    "Everything is set! Your vehicle has been prepared. See you soon.",
    "Your vehicle is fully fuelled and ready. Please be on time."
  ],
  general: [
    "Please contact our team for an update regarding your booking.",
    "There is an important update about your reservation. Please check your dashboard."
  ]
};

// ─── Format 24h time to AM/PM ───────────────────────────────────────────────────
const formatTimeAMPM = (time24) => {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
};

// ─── Send Notice Modal ───────────────────────────────────────────────────────
function SendNoticeModal({ booking, onClose, onSent }) {
  const [type, setType] = useState('general');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [notices, setNotices] = useState([]);
  const [loadingNotices, setLoadingNotices] = useState(true);

  const vehicleName = `${booking.vehicle?.brand || ''} ${booking.vehicle?.model || ''}`.trim();

  const loadBookingNotices = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/notifications/booking/${booking._id}`);
      const data = await res.json();
      if (data.success) {
        setNotices(data.data);
      }
    } catch (err) {
      console.error('Failed to load notices:', err);
    } finally {
      setLoadingNotices(false);
    }
  }, [booking._id]);

  useEffect(() => {
    loadBookingNotices();
  }, [loadBookingNotices]);

  const handleSend = async () => {
    if (!message.trim()) { alert('Please enter a message.'); return; }
    setSending(true);
    try {
      await sendNotification({
        bookingId: booking._id,
        customerId: booking.customerId,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        vehicleId: booking.vehicleId,
        vehicleName,
        message: message.trim(),
        type
      });
      onSent();
      onClose();
    } catch (err) {
      alert('Failed to send notification: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const typeColors = {
    general: '#6366f1',
    vehicle_issue: '#ef4444',
    time_change: '#f59e0b',
    cancelled: '#dc2626',
    ready: '#10b981'
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '20px'
    }}>
      <div style={{
        background: 'white', borderRadius: '20px', padding: '36px',
        width: '100%', maxWidth: '540px', boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
        animation: 'fadeInUp 0.3s ease'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h2 style={{ margin: '0 0 6px', fontSize: '1.4rem', fontWeight: 800, color: '#1e293b' }}>
              📢 Send Notice to Customer
            </h2>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
              <strong>{booking.customerName}</strong> · {vehicleName}
            </p>
          </div>
          <button onClick={onClose} style={{
            background: '#f1f5f9', border: 'none', borderRadius: '50%',
            width: '36px', height: '36px', cursor: 'pointer', fontSize: '1.1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b'
          }}>✕</button>
        </div>

        {/* Booking Info */}
        <div style={{
          background: '#f8fafc', borderRadius: '12px', padding: '14px 16px',
          marginBottom: '22px', border: '1px solid #e2e8f0', fontSize: '0.875rem', color: '#475569'
        }}>
          🗓️ <strong>From:</strong> {booking.startDate} {formatTimeAMPM(booking.pickupTime || '10:00')} &nbsp;→&nbsp;
          <strong>To:</strong> {booking.endDate} {formatTimeAMPM(booking.returnTime || '10:00')}
        </div>

        {/* Conversation History */}
        {!loadingNotices && notices.length > 0 && (
          <div style={{
            marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '15px',
            maxHeight: '220px', overflowY: 'auto', border: '1px solid #e2e8f0',
            borderRadius: '12px', padding: '12px', background: '#f8fafc'
          }}>
            <h4 style={{ margin: '0 0 8px', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>
              💬 Notice Thread History
            </h4>
            {notices.map(notice => (
              <div key={notice._id} style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '8px' }}>
                <div style={{ background: '#f1f5f9', padding: '8px 12px', borderRadius: '8px', borderLeft: '3px solid #3b82f6' }}>
                  <small style={{ fontWeight: 'bold', color: '#2563eb' }}>Notice ({new Date(notice.createdAt).toLocaleDateString()}):</small>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#1e293b' }}>{notice.message}</p>
                </div>
                
                {/* Replies in thread */}
                {notice.thread && notice.thread.map((msg, idx) => (
                  <div key={idx} style={{
                    marginLeft: '15px', marginTop: '8px',
                    background: msg.sender === 'admin' ? '#e0e7ff' : '#ffffff',
                    padding: '6px 10px', borderRadius: '8px', border: '1px solid #e2e8f0',
                    alignSelf: msg.sender === 'admin' ? 'flex-end' : 'flex-start',
                    maxWidth: '90%'
                  }}>
                    <small style={{ fontWeight: 'bold', color: msg.sender === 'admin' ? '#4f46e5' : '#475569' }}>
                      {msg.sender === 'admin' ? 'You (Admin)' : 'Customer'}
                    </small>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: '#1e293b' }}>{msg.text}</p>
                  </div>
                ))}

                {/* Quick Inline Reply for Admin */}
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const text = e.target.elements.adminReply.value;
                  if (!text.trim()) return;
                  try {
                    const res = await fetch(`http://localhost:5000/api/notifications/${notice._id}/reply`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ sender: 'admin', text })
                    });
                    if (res.ok) {
                      loadBookingNotices();
                    }
                  } catch (err) {
                    console.error('Failed admin reply:', err);
                  }
                  e.target.reset();
                }} style={{ display: 'flex', gap: '8px', marginTop: '8px', marginLeft: '15px' }}>
                  <input 
                    name="adminReply" 
                    type="text" 
                    placeholder="Reply to customer..." 
                    required 
                    style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }} 
                  />
                  <button type="submit" style={{ padding: '6px 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>Reply</button>
                </form>
              </div>
            ))}
          </div>
        )}

        {/* Custom Message */}
        <label style={{ display: 'block', fontWeight: 700, color: '#374151', marginBottom: '8px', fontSize: '0.9rem' }}>
          Message
        </label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Type your message to the customer..."
          rows={4}
          style={{
            width: '100%', padding: '12px 14px', borderRadius: '12px',
            border: '1.5px solid #e2e8f0', fontSize: '0.9rem', resize: 'vertical',
            fontFamily: 'Inter, sans-serif', color: '#1e293b', outline: 'none',
            boxSizing: 'border-box', lineHeight: 1.6
          }}
        />
        <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '6px' }}>
          {message.length}/500 characters
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '13px', background: '#f1f5f9', border: 'none',
              borderRadius: '12px', cursor: 'pointer', fontWeight: 600,
              color: '#64748b', fontSize: '0.95rem'
            }}
          >Cancel</button>
          <button
            onClick={handleSend}
            disabled={sending || !message.trim()}
            style={{
              flex: 2, padding: '13px', background: sending || !message.trim()
                ? '#cbd5e1' : `linear-gradient(135deg, ${typeColors[type]}, ${typeColors[type]}cc)`,
              border: 'none', borderRadius: '12px', cursor: sending || !message.trim() ? 'not-allowed' : 'pointer',
              fontWeight: 700, color: 'white', fontSize: '0.95rem', transition: 'all 0.2s'
            }}
          >
            {sending ? '⏳ Sending...' : '📢 Send Notice'}
          </button>
        </div>
      </div>

      <style>{`@keyframes fadeInUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'vehicle'
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [noticeBooking, setNoticeBooking] = useState(null); // booking currently targeted for notice

  const loadBookings = useCallback(async () => {
    try {
      const data = await getAllBookings();
      setBookings(data);
      setError(false);
    } catch (err) {
      console.error('Failed to load bookings:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
    const interval = setInterval(loadBookings, 5000);
    return () => clearInterval(interval);
  }, [loadBookings]);

  // Extract unique vehicles that have at least one booking
  const uniqueVehicles = [];
  const seenVehicleIds = new Set();
  bookings.forEach(b => {
    if (b.vehicleId && !seenVehicleIds.has(b.vehicleId)) {
      seenVehicleIds.add(b.vehicleId);
      uniqueVehicles.push({
        _id: b.vehicleId,
        brand: b.vehicle?.brand || 'Unknown',
        model: b.vehicle?.model || 'Vehicle',
        image: b.vehicle?.image || '',
        pricePerDay: b.vehicle?.pricePerDay
      });
    }
  });

  // Sort vehicles alphabetically
  uniqueVehicles.sort((a, b) => {
    const nameA = `${a.brand} ${a.model}`.toLowerCase();
    const nameB = `${b.brand} ${b.model}`.toLowerCase();
    return nameA.localeCompare(nameB);
  });

  // Auto-select first vehicle when switching to vehicle view if nothing is selected
  useEffect(() => {
    if (viewMode === 'vehicle' && !selectedVehicleId && uniqueVehicles.length > 0) {
      setSelectedVehicleId(uniqueVehicles[0]._id);
    }
  }, [viewMode, uniqueVehicles, selectedVehicleId]);

  const filteredVehicles = uniqueVehicles.filter(v => {
    const fullName = `${v.brand} ${v.model}`.toLowerCase();
    return fullName.includes(vehicleSearchQuery.toLowerCase());
  });

  const getBookingCountForVehicle = (vId) => {
    return bookings.filter(b => b.vehicleId === vId).length;
  };

  const filteredBookings = bookings.filter(b => {
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchVehicle = vehicleFilter === 'all' || b.vehicleId === vehicleFilter;
    return matchStatus && matchVehicle;
  });

  const handleStatusUpdate = async (bookingId, newStatus) => {
    if (!window.confirm(`Are you sure you want to ${newStatus} this booking?`)) return;
    try {
      await updateBookingStatus(bookingId, newStatus);
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: newStatus } : b));
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleApproveChange = async (bookingId) => {
    if (!window.confirm('Approve this vehicle change request? Price and vehicle details will update.')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}/approve-change`, {
        method: 'PUT'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('Change approved successfully!');
        setBookings(prev => prev.map(b => b._id === bookingId ? data.data : b));
      } else {
        alert('Failed to approve change: ' + data.message);
      }
    } catch (err) {
      alert('Error approving change request');
    }
  };

  const handleRejectChange = async (bookingId) => {
    if (!window.confirm('Reject this vehicle change request?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}/reject-change`, {
        method: 'PUT'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('Change request rejected.');
        setBookings(prev => prev.map(b => b._id === bookingId ? data.data : b));
      } else {
        alert('Failed to reject change: ' + data.message);
      }
    } catch (err) {
      alert('Error rejecting change request');
    }
  };

  const handleTimeExtend = async (booking) => {
    const newEndDate = window.prompt('Enter new return date (YYYY-MM-DD):', booking.endDate);
    if (!newEndDate) return;
    const newReturnTime = window.prompt('Enter new return time (HH:MM):', booking.returnTime || '10:00');
    if (!newReturnTime) return;

    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${booking._id}/time`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endDate: newEndDate, returnTime: newReturnTime })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBookings(prev => prev.map(b => b._id === booking._id ? { ...b, endDate: newEndDate, returnTime: newReturnTime, totalDays: data.data.totalDays, totalPrice: data.data.totalPrice } : b));
        alert('Booking time extended successfully!');
      } else {
        alert('Failed to extend time: ' + data.message);
      }
    } catch (err) {
      alert('Error extending time');
    }
  };

  const handleDelete = async (bookingId) => {
    if (!window.confirm('Delete this booking permanently?')) return;
    try {
      await deleteBooking(bookingId);
      setBookings(prev => prev.filter(b => b._id !== bookingId));
    } catch (err) {
      alert('Failed to delete booking: ' + (err.response?.data?.message || err.message));
    }
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    rejected: bookings.filter(b => b.status === 'rejected' || b.status === 'cancelled').length,
    revenue: bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.totalPrice || 0), 0)
  };

  return (
    <div className="mb-page">
      <div className="page-header">
        <h1>Manage Bookings</h1>
        <p>Approve, reject, or monitor all bookings</p>
      </div>

      <div className="mb-container">
        {/* Stats */}
        <div className="mb-stats">
          <div className="mb-stat-card mb-total">
            <h3>{stats.total}</h3>
            <p>Total Bookings</p>
          </div>
          <div className="mb-stat-card mb-pending">
            <h3>{stats.pending}</h3>
            <p>Pending</p>
          </div>
          <div className="mb-stat-card mb-confirmed">
            <h3>{stats.confirmed}</h3>
            <p>Confirmed</p>
          </div>
          <div className="mb-stat-card mb-completed">
            <h3>{stats.completed}</h3>
            <p>Completed</p>
          </div>
          <div className="mb-stat-card mb-rejected">
            <h3>{stats.rejected}</h3>
            <p>Rejected/Cancelled</p>
          </div>
          <div className="mb-stat-card" style={{ borderTop: '4px solid #6366f1' }}>
            <h3>LKR {(stats.revenue / 1000).toFixed(0)}K</h3>
            <p>Revenue</p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="mb-view-tabs">
          <button 
            className={`mb-tab-btn ${viewMode === 'all' ? 'active' : ''}`}
            onClick={() => setViewMode('all')}
          >
            📋 All Bookings List
          </button>
          <button 
            className={`mb-tab-btn ${viewMode === 'vehicle' ? 'active' : ''}`}
            onClick={() => setViewMode('vehicle')}
          >
            🚗 View by Vehicle
          </button>
        </div>

        {/* Toolbar (Only for All Bookings view) */}
        {viewMode === 'all' && (
          <div className="mb-toolbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaFilter className="mb-filter-icon" />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="mb-select">
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <select value={vehicleFilter} onChange={(e) => setVehicleFilter(e.target.value)} className="mb-select">
                  <option value="all">All Vehicles</option>
                  {uniqueVehicles.map(v => (
                    <option key={v._id} value={v._id}>{v.brand} {v.model}</option>
                  ))}
                </select>
              </div>
            </div>
            <p className="mb-count">{filteredBookings.length} bookings found</p>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="mb-empty">
            <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
            <h3>Loading bookings...</h3>
          </div>
        ) : error ? (
          <div className="mb-empty">
            <FaCalendarCheck />
            <h3>Cannot connect to server</h3>
            <p>Make sure the backend is running (cd backend → npm run dev)</p>
          </div>
        ) : (
          <>
            {viewMode === 'all' ? (
              filteredBookings.length === 0 ? (
                <div className="mb-empty">
                  <FaCalendarCheck />
                  <h3>No bookings found</h3>
                  <p>Bookings will appear here when customers make reservations</p>
                </div>
              ) : (
                <div className="mb-table-wrapper">
                  <table className="mb-table">
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Vehicle</th>
                        <th>Dates</th>
                        <th>Locations</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Booked On</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map((b) => (
                        <tr key={b._id}>
                          {/* Customer */}
                          <td>
                            <strong className="mb-cust-name">{b.customerName}</strong>
                            <small className="mb-cust-info">{b.customerEmail}</small>
                            <small className="mb-cust-info">{b.customerPhone}</small>
                          </td>

                          {/* Vehicle */}
                          <td>
                            <div className="mb-vehicle">
                              <img src={b.vehicle?.image} alt={b.vehicle?.brand} className="mb-vehicle-img" />
                              <strong className="mb-vehicle-name">
                                {b.vehicle?.brand} {b.vehicle?.model}
                              </strong>
                            </div>
                            {b.changeStatus === 'pending' && (
                              <div style={{ marginTop: '8px', padding: '8px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', fontSize: '0.8rem', maxWidth: '240px' }}>
                                <span style={{ color: '#b45309', fontWeight: 800 }}>⚠️ Change Requested:</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                                  <img src={b.proposedVehicle?.image} alt={b.proposedVehicle?.brand} style={{ width: '40px', height: '30px', objectFit: 'cover', borderRadius: '4px' }} />
                                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{b.proposedVehicle?.brand} {b.proposedVehicle?.model}</span>
                                </div>
                              </div>
                            )}
                          </td>

                          {/* Dates */}
                          <td>
                            <div><strong>From:</strong> {new Date(b.startDate).toLocaleDateString()} {formatTimeAMPM(b.pickupTime || '10:00')}</div>
                            <div><strong>To:</strong> {new Date(b.endDate).toLocaleDateString()} {formatTimeAMPM(b.returnTime || '10:00')}</div>
                            <div className="mb-days">{b.totalDays} day{b.totalDays > 1 ? 's' : ''}</div>
                          </td>

                          {/* Locations */}
                          <td>
                            <div><strong>Pickup:</strong> {b.pickupLocation || '—'}</div>
                            <div><strong>Dropoff:</strong> {b.dropoffLocation || '—'}</div>
                          </td>

                          {/* Amount */}
                          <td>
                            <strong className="mb-amount">LKR {b.totalPrice?.toLocaleString()}</strong>
                          </td>

                          {/* Status */}
                          <td>
                            <span className={`mb-status mb-status-${b.status}`}>{b.status}</span>
                          </td>

                          {/* Booked On */}
                          <td className="mb-booked-on">
                            {new Date(b.createdAt).toLocaleDateString()}
                          </td>

                          {/* Actions */}
                          <td>
                            <div className="mb-actions">
                              {b.changeStatus === 'pending' && (
                                <div style={{ display: 'flex', gap: '6px', background: '#fffbeb', padding: '6px', borderRadius: '8px', border: '1px solid #fde68a', marginRight: '4px' }}>
                                  <button
                                    onClick={() => handleApproveChange(b._id)}
                                    style={{ padding: '6px 10px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 800, fontSize: '0.75rem' }}
                                    title="Approve Vehicle Change"
                                  >
                                    Approve Change
                                  </button>
                                  <button
                                    onClick={() => handleRejectChange(b._id)}
                                    style={{ padding: '6px 10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 800, fontSize: '0.75rem' }}
                                    title="Reject Change"
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                              {b.status === 'pending' && (
                                <>
                                  <button
                                    className="mb-btn mb-btn-approve"
                                    onClick={() => handleStatusUpdate(b._id, 'confirmed')}
                                    title="Approve"
                                  >
                                    <FaCheck />
                                  </button>
                                  <button
                                    className="mb-btn mb-btn-reject"
                                    onClick={() => handleStatusUpdate(b._id, 'rejected')}
                                    title="Reject"
                                  >
                                    <FaTimes />
                                  </button>
                                </>
                              )}
                              {b.status === 'confirmed' && (
                                <button
                                  className="mb-btn mb-btn-complete"
                                  onClick={() => handleStatusUpdate(b._id, 'completed')}
                                >
                                  Complete
                                </button>
                              )}
                              {['completed', 'rejected', 'cancelled'].includes(b.status) && (
                                <span className="mb-no-action">—</span>
                              )}

                              {/* 📢 Send Notice button — available for ALL bookings */}
                              <button
                                className="mb-btn"
                                onClick={() => setNoticeBooking(b)}
                                title="Send Notice to Customer"
                                style={{
                                  marginLeft: '4px',
                                  background: '#eff6ff',
                                  color: '#3b82f6',
                                  border: '1px solid #bfdbfe',
                                  fontSize: '0.75rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '5px 10px',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  fontWeight: 700,
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                <FaBell style={{ fontSize: '0.8rem' }} /> Notice
                              </button>

                              <button
                                className="mb-btn mb-btn-reject"
                                onClick={() => handleDelete(b._id)}
                                title="Delete"
                                style={{ marginLeft: '4px', fontSize: '0.7rem' }}
                              >
                                Del
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              /* Vehicle Split View */
              <div className="mb-vehicle-split">
                {/* Left Sidebar: Vehicle List */}
                <div className="mb-vehicle-sidebar">
                  <div className="mb-sidebar-search">
                    <input 
                      type="text" 
                      placeholder="🔍 Search vehicles..." 
                      value={vehicleSearchQuery}
                      onChange={e => setVehicleSearchQuery(e.target.value)}
                      className="mb-search-input"
                    />
                  </div>
                  
                  <div className="mb-sidebar-list">
                    {filteredVehicles.length === 0 ? (
                      <div className="mb-sidebar-empty">No vehicles found</div>
                    ) : (
                      filteredVehicles.map(v => {
                        const count = getBookingCountForVehicle(v._id);
                        const isSelected = selectedVehicleId === v._id;
                        return (
                          <div 
                            key={v._id}
                            className={`mb-vehicle-item ${isSelected ? 'active' : ''}`}
                            onClick={() => setSelectedVehicleId(v._id)}
                          >
                            <img src={v.image} alt={v.brand} className="mb-sidebar-img" />
                            <div className="mb-sidebar-info">
                              <strong className="mb-sidebar-name">{v.brand} {v.model}</strong>
                              <span className="mb-sidebar-count">{count} booking{count !== 1 ? 's' : ''}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Right Main Panel: Bookings for Selected Vehicle */}
                <div className="mb-vehicle-main">
                  {selectedVehicleId ? (
                    (() => {
                      const selectedVehicle = uniqueVehicles.find(v => v._id === selectedVehicleId);
                      const vehicleBookings = bookings.filter(b => b.vehicleId === selectedVehicleId);
                      
                      return (
                        <>
                          {/* Selected Vehicle Header card */}
                          {selectedVehicle && (
                            <div className="mb-selected-vehicle-header">
                              <img src={selectedVehicle.image} alt={selectedVehicle.brand} className="mb-selected-img" />
                              <div className="mb-selected-info">
                                <h2>{selectedVehicle.brand} {selectedVehicle.model}</h2>
                                <p className="mb-selected-price">Base Rate: LKR {selectedVehicle.pricePerDay?.toLocaleString()}/day</p>
                                <span className="mb-selected-badge">{vehicleBookings.length} Total Bookings</span>
                              </div>
                            </div>
                          )}

                          {/* Bookings List */}
                          {vehicleBookings.length === 0 ? (
                            <div className="mb-main-empty">
                              <h3>No bookings for this vehicle</h3>
                              <p>When customers make reservations for this vehicle, they will show up here.</p>
                            </div>
                          ) : (
                            <div className="mb-cards-grid">
                              {vehicleBookings.map(b => (
                                <div key={b._id} className={`mb-booking-card status-${b.status}`}>
                                  {/* Card Header: Customer & Status */}
                                  <div className="mb-card-header">
                                    <div>
                                      <h3 className="mb-card-cust-name">{b.customerName}</h3>
                                      <span className="mb-card-cust-contact">{b.customerEmail} | {b.customerPhone}</span>
                                    </div>
                                    <span className={`mb-status mb-status-${b.status}`}>{b.status}</span>
                                  </div>

                                  {/* Card Body: Details */}
                                  <div className="mb-card-body">
                                    <div className="mb-card-row">
                                      <span>🗓️ <strong>Duration:</strong></span>
                                      <span>
                                        {new Date(b.startDate).toLocaleDateString()} {formatTimeAMPM(b.pickupTime || '10:00')} to {new Date(b.endDate).toLocaleDateString()} {formatTimeAMPM(b.returnTime || '10:00')}
                                        <span className="mb-card-days"> ({b.totalDays} day{b.totalDays > 1 ? 's' : ''})</span>
                                      </span>
                                    </div>
                                    <div className="mb-card-row">
                                      <span>📍 <strong>Locations:</strong></span>
                                      <span>Pickup: {b.pickupLocation || '—'} &nbsp;|&nbsp; Dropoff: {b.dropoffLocation || '—'}</span>
                                    </div>
                                    <div className="mb-card-row">
                                      <span>💰 <strong>Total Price:</strong></span>
                                      <strong className="mb-card-price">LKR {b.totalPrice?.toLocaleString()}</strong>
                                    </div>
                                    <div className="mb-card-row">
                                      <span>📅 <strong>Booked On:</strong></span>
                                      <span>{new Date(b.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    {b.changeStatus === 'pending' && (
                                      <div className="mb-card-row" style={{ gridColumn: 'span 2', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px', marginTop: '5px' }}>
                                        <div style={{ fontSize: '1.5rem' }}>⚠️</div>
                                        <div>
                                          <strong style={{ display: 'block', color: '#b45309', fontSize: '0.85rem' }}>CUSTOMER REQUESTED VEHICLE CHANGE:</strong>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                                            <span style={{ textDecoration: 'line-through', color: '#64748b' }}>{b.vehicle?.brand} {b.vehicle?.model}</span>
                                            <span>→</span>
                                            <strong style={{ color: '#0f172a' }}>{b.proposedVehicle?.brand} {b.proposedVehicle?.model}</strong>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Card Actions */}
                                  <div className="mb-card-actions">
                                    <div className="mb-card-action-left">
                                      {b.changeStatus === 'pending' && (
                                        <div style={{ display: 'flex', gap: '8px', marginRight: '6px' }}>
                                          <button
                                            onClick={() => handleApproveChange(b._id)}
                                            className="mb-btn mb-btn-approve mb-btn-label"
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                          >
                                            ✓ Approve Change
                                          </button>
                                          <button
                                            onClick={() => handleRejectChange(b._id)}
                                            className="mb-btn mb-btn-reject mb-btn-label"
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                          >
                                            ✗ Reject
                                          </button>
                                        </div>
                                      )}
                                      {b.status === 'pending' && (
                                        <>
                                          <button
                                            className="mb-btn mb-btn-approve"
                                            onClick={() => handleStatusUpdate(b._id, 'confirmed')}
                                            title="Approve"
                                            style={{ display: 'inline-flex', padding: '10px 16px', gap: '6px', fontSize: '0.85rem' }}
                                          >
                                            <FaCheck /> Approve
                                          </button>
                                          <button
                                            className="mb-btn mb-btn-reject"
                                            onClick={() => handleStatusUpdate(b._id, 'rejected')}
                                            title="Reject"
                                            style={{ display: 'inline-flex', padding: '10px 16px', gap: '6px', fontSize: '0.85rem' }}
                                          >
                                            <FaTimes /> Reject
                                          </button>
                                        </>
                                      )}
                                      {b.status === 'confirmed' && (
                                        <button
                                          className="mb-btn mb-btn-complete"
                                          onClick={() => handleStatusUpdate(b._id, 'completed')}
                                        >
                                          Complete
                                        </button>
                                      )}
                                      {['completed', 'rejected', 'cancelled'].includes(b.status) && (
                                        <span className="mb-no-action">No action needed</span>
                                      )}
                                    </div>

                                    <div className="mb-card-action-right" style={{ display: 'flex', gap: '8px' }}>
                                      {/* Send Notice button */}
                                      <button
                                        className="mb-btn mb-btn-label"
                                        onClick={() => setNoticeBooking(b)}
                                        title="Send Notice to Customer"
                                        style={{
                                          background: '#eff6ff',
                                          color: '#3b82f6',
                                          border: '1px solid #bfdbfe',
                                          fontSize: '0.8rem',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '6px',
                                          fontWeight: 700
                                        }}
                                      >
                                        <FaBell /> Notice
                                      </button>

                                      <button
                                        className="mb-btn mb-btn-reject"
                                        onClick={() => handleDelete(b._id)}
                                        title="Delete"
                                        style={{ padding: '8px 14px', fontSize: '0.8rem', width: 'auto', height: 'auto', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                      >
                                        🗑️ Delete
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      );
                    })()
                  ) : (
                    <div className="mb-main-empty">
                      <h3>Select a vehicle</h3>
                      <p>Please select a vehicle from the left pane to view its bookings.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Send Notice Modal */}
      {noticeBooking && (
        <SendNoticeModal
          booking={noticeBooking}
          onClose={() => setNoticeBooking(null)}
          onSent={() => alert(`✅ Notice sent to ${noticeBooking.customerName}!`)}
        />
      )}
    </div>
  );
}