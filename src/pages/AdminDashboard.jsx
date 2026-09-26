import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { FaUsers, FaCar, FaCalendarCheck, FaChartBar, FaUserTie, FaCheckCircle, FaEnvelope, FaSpinner, FaPhone, FaMapMarkerAlt, FaIdCard, FaBuilding, FaTimes, FaCalendarAlt, FaClock } from 'react-icons/fa';
import { getUsers } from '../services/userService.js';
import { fetchVehicles } from '../services/vehicleService.js';
import { getAllBookings } from '../services/bookingService.js';
import './AdminDashboard.css';

// ── User Detail Modal ──────────────────────────────────────────────
function UserDetailModal({ user, onClose }) {
  if (!user) return null;

  const roleColors = {
    admin: { bg: '#e0e7ff', color: '#4f46e5' },
    provider: { bg: '#d1fae5', color: '#065f46' },
    customer: { bg: '#dbeafe', color: '#1e40af' }
  };
  const rc = roleColors[user.role] || { bg: '#f3f4f6', color: '#374151' };

  return (
    <div className="ud-overlay" onClick={onClose}>
      <div className="ud-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="ud-header">
          <div className="ud-avatar">
            <FaUserTie />
          </div>
          <div className="ud-header-info">
            <h2>{user.name}</h2>
            <span className="ud-role-badge" style={{ background: rc.bg, color: rc.color }}>
              {user.role}
            </span>
          </div>
          <button className="ud-close" onClick={onClose}><FaTimes /></button>
        </div>

        {/* Details Grid */}
        <div className="ud-body">
          <div className="ud-field">
            <FaEnvelope className="ud-field-icon" />
            <div>
              <span className="ud-label">Email</span>
              <span className="ud-value">{user.email || '—'}</span>
            </div>
          </div>

          <div className="ud-field">
            <FaPhone className="ud-field-icon" />
            <div>
              <span className="ud-label">Phone</span>
              <span className="ud-value">{user.phone || '—'}</span>
            </div>
          </div>

          <div className="ud-field">
            <FaMapMarkerAlt className="ud-field-icon" />
            <div>
              <span className="ud-label">Address</span>
              <span className="ud-value">{user.address || '—'}</span>
            </div>
          </div>

          {user.role === 'provider' && (
            <div className="ud-field">
              <FaBuilding className="ud-field-icon" />
              <div>
                <span className="ud-label">Company Name</span>
                <span className="ud-value">{user.companyName || '—'}</span>
              </div>
            </div>
          )}

          {user.role === 'customer' && (
            <div className="ud-field">
              <FaIdCard className="ud-field-icon" />
              <div>
                <span className="ud-label">Driving Licence No</span>
                <span className="ud-value">{user.licenseNo || '—'}</span>
              </div>
            </div>
          )}

          {(user.role === 'provider') && (
            <div className="ud-field">
              <FaIdCard className="ud-field-icon" />
              <div>
                <span className="ud-label">Business Licence No</span>
                <span className="ud-value">{user.licenseNo || '—'}</span>
              </div>
            </div>
          )}

          <div className="ud-field">
            <FaCalendarAlt className="ud-field-icon" />
            <div>
              <span className="ud-label">Joined</span>
              <span className="ud-value">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
              </span>
            </div>
          </div>

          <div className="ud-field">
            <div className="ud-field-icon" style={{ color: user.isBlocked ? '#ef4444' : '#10b981' }}>●</div>
            <div>
              <span className="ud-label">Account Status</span>
              <span className="ud-value" style={{ color: user.isBlocked ? '#ef4444' : '#10b981', fontWeight: 700 }}>
                {user.isBlocked ? 'Blocked' : 'Active'}
              </span>
            </div>
          </div>
        </div>

        <div className="ud-footer">
          <Link to="/admin/users" className="btn btn-primary btn-sm" onClick={onClose}>
            Manage User
          </Link>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [usersData, vehiclesData, bookingsData] = await Promise.all([
        getUsers(),
        fetchVehicles(),
        getAllBookings()
      ]);
      setUsers(usersData || []);
      setVehicles(vehiclesData || []);
      setBookings(bookingsData || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  const stats = {
    totalUsers: users.length,
    totalCustomers: users.filter(u => u.role === 'customer').length,
    totalProviders: users.filter(u => u.role === 'provider').length,
    totalAdmins: users.filter(u => u.role === 'admin').length,
    totalVehicles: vehicles.length,
    availableVehicles: vehicles.filter(v => v.available !== false).length,
    totalBookings: bookings.length,
    pendingBookings: bookings.filter(b => b.status === 'pending').length,
    confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
    completedBookings: bookings.filter(b => b.status === 'completed').length,
    revenue: bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.totalPrice || 0), 0)
  };

  const recentUsers = [...users].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="page-header">
          <h1>Admin Dashboard</h1>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px', gap: '15px', color: '#6366f1', fontSize: '1.1rem' }}>
          <FaSpinner style={{ animation: 'spin 1s linear infinite', fontSize: '1.5rem' }} />
          Loading real-time data...
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back, {user?.name}! <span style={{ fontSize: '0.85rem', color: '#a5b4fc' }}>● Live data</span></p>
      </div>
      <div className="container">
        {/* Stats Grid */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="stat-icon users"><FaUsers /></div>
            <div className="stat-info"><h3>{stats.totalUsers}</h3><p>Total Users</p></div>
          </div>
          <div className="admin-stat-card">
            <div className="stat-icon customers"><FaUserTie /></div>
            <div className="stat-info"><h3>{stats.totalCustomers}</h3><p>Customers</p></div>
          </div>
          <div className="admin-stat-card">
            <div className="stat-icon providers"><FaUserTie /></div>
            <div className="stat-info"><h3>{stats.totalProviders}</h3><p>Providers</p></div>
          </div>
          <div className="admin-stat-card">
            <div className="stat-icon vehicles"><FaCar /></div>
            <div className="stat-info"><h3>{stats.totalVehicles}</h3><p>Total Vehicles</p></div>
          </div>
          <div className="admin-stat-card">
            <div className="stat-icon available"><FaCheckCircle /></div>
            <div className="stat-info"><h3>{stats.availableVehicles}</h3><p>Available</p></div>
          </div>
          <div className="admin-stat-card">
            <div className="stat-icon bookings"><FaCalendarCheck /></div>
            <div className="stat-info"><h3>{stats.totalBookings}</h3><p>Total Bookings</p></div>
          </div>
          <div className="admin-stat-card">
            <div className="stat-icon pending"><FaCalendarCheck /></div>
            <div className="stat-info"><h3>{stats.pendingBookings}</h3><p>Pending</p></div>
          </div>
          <div className="admin-stat-card">
            <div className="stat-icon revenue"><FaChartBar /></div>
            <div className="stat-info"><h3>LKR {(stats.revenue / 1000).toFixed(0)}K</h3><p>Revenue</p></div>
          </div>
        </div>

        {/* Recent Registrations — clickable */}
        {recentUsers.length > 0 && (
          <div className="recent-section">
            <h2 className="section-heading">Recent Registrations</h2>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '15px', marginTop: '-15px' }}>
              Click on a card to view user details
            </p>
            <div className="recent-users">
              {recentUsers.map((u) => (
                <div
                  key={u._id}
                  className="recent-user-card recent-user-card--clickable"
                  onClick={() => setSelectedUser(u)}
                  title="Click to view details"
                >
                  <div className="user-avatar"><FaUserTie /></div>
                  <div style={{ flex: 1 }}>
                    <strong>{u.name}</strong>
                    <p>{u.email}</p>
                    <span className={`role-badge ${u.role}`}>{u.role}</span>
                  </div>
                  <div className="user-date">{new Date(u.createdAt).toLocaleDateString()}</div>
                  <div className="user-card-arrow">›</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="admin-quick-actions">
          <h2 className="section-heading"><FaChartBar /> Quick Actions</h2>
          <div className="action-cards">
            <Link to="/admin/users" className="action-card">
              <FaUsers />
              <h3>Manage Users</h3>
              <p>View, block, or delete users</p>
              <div className="action-stat">{stats.totalUsers} users</div>
            </Link>
            <Link to="/admin/vehicles" className="action-card">
              <FaCar />
              <h3>Manage Vehicles</h3>
              <p>Monitor all vehicle listings</p>
              <div className="action-stat">{stats.totalVehicles} vehicles</div>
            </Link>
            <Link to="/admin/bookings" className="action-card">
              <FaCalendarCheck />
              <h3>Manage Bookings</h3>
              <p>Approve or reject bookings</p>
              <div className="action-stat">{stats.pendingBookings} pending</div>
            </Link>
            <Link to="/admin/messages" className="action-card">
              <FaEnvelope />
              <h3>Contact Messages</h3>
              <p>View customer questions</p>
              <div className="action-stat">View all</div>
            </Link>
            <Link to="/admin/delays" className="action-card">
              <FaClock />
              <h3>Delay Reports</h3>
              <p>Manage booking delays</p>
              <div className="action-stat">View delays</div>
            </Link>
          </div>
        </div>

        {/* Recent Bookings */}
        {bookings.length > 0 && (
          <div className="recent-section">
            <h2 className="section-heading">Recent Bookings</h2>
            <div style={{ overflowX: 'auto', background: 'white', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white' }}>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600 }}>Customer</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600 }}>Vehicle</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600 }}>Amount</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600 }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.slice(0, 5).map((b) => {
                    const statusColors = {
                      pending: { bg: '#fef3c7', color: '#92400e' },
                      confirmed: { bg: '#d1fae5', color: '#065f46' },
                      completed: { bg: '#dbeafe', color: '#1e40af' },
                      rejected: { bg: '#fee2e2', color: '#991b1b' },
                      cancelled: { bg: '#f3f4f6', color: '#6b7280' }
                    };
                    const sc = statusColors[b.status] || { bg: '#f3f4f6', color: '#374151' };
                    return (
                      <tr key={b._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <strong style={{ color: '#1e293b' }}>{b.customerName}</strong>
                          <br /><small style={{ color: '#64748b' }}>{b.customerEmail}</small>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#475569' }}>
                          {b.vehicle?.brand} {b.vehicle?.model}
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: '#6366f1' }}>
                          LKR {b.totalPrice?.toLocaleString()}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, background: sc.bg, color: sc.color, textTransform: 'uppercase' }}>
                            {b.status}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.85rem' }}>
                          {new Date(b.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: '15px', textAlign: 'right' }}>
              <Link to="/admin/bookings" className="btn btn-primary btn-sm">View All Bookings →</Link>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
}