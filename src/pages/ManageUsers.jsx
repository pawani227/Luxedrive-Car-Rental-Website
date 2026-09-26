import { useState, useEffect } from 'react';
import { FaSearch, FaBan, FaUnlock, FaTrash, FaUser } from 'react-icons/fa';
import { getUsers, blockUser, deleteUser } from '../services/userService.js';

const demoUsers = [
  { _id: 'demo-admin', name: 'Admin User', email: 'admin@luxedrive.com', role: 'admin', phone: '+94 11 111 1111', createdAt: '2024-01-01', isBlocked: false, isDemo: true },
  { _id: 'demo-provider', name: 'Premium Rentals', email: 'provider@luxedrive.com', role: 'provider', phone: '+94 11 234 5678', companyName: 'Premium Auto Rentals', createdAt: '2024-01-01', isBlocked: false, isDemo: true },
  { _id: 'demo-customer', name: 'John Doe', email: 'customer@luxedrive.com', role: 'customer', phone: '+94 77 123 4567', createdAt: '2024-01-01', isBlocked: false, isDemo: true }
];

export default function ManageUsers() {
  // Admin page to view and manage registered users.
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const loadUsers = async () => {
    try {
      const users = await getUsers();
      setRegisteredUsers(users);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  useEffect(() => {
    loadUsers();
    const interval = setInterval(loadUsers, 3000);
    return () => clearInterval(interval);
  }, []);

  const allUsers = [
    ...demoUsers,
    ...registeredUsers.map(u => ({ ...u, isDemo: false }))
  ];

  const filteredUsers = allUsers.filter((user) => {
    const matchesSearch = (user.name || '').toLowerCase().includes(search.toLowerCase()) || 
                          (user.email || '').toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleDeleteUser = async (userId, isDemo) => {
    if (isDemo) { alert('Cannot delete demo accounts!'); return; }
    if (window.confirm('Delete this user?')) {
      try {
        await deleteUser(userId);
        alert('Deleted!');
        loadUsers();
      } catch (err) {
        alert('Failed to delete user: ' + err.message);
      }
    }
  };

  const handleBlockUser = async (userId, isDemo, isCurrentlyBlocked) => {
    if (isDemo) { alert('Cannot block demo accounts!'); return; }
    const action = isCurrentlyBlocked ? 'unblock' : 'block';
    try {
      await blockUser(userId, !isCurrentlyBlocked);
      alert(isCurrentlyBlocked ? 'Unblocked!' : 'Blocked!');
      loadUsers();
    } catch (err) {
      alert(`Failed to ${action} user: ` + err.message);
    }
  };

  const stats = {
    total: allUsers.length,
    customers: allUsers.filter(u => u.role === 'customer').length,
    providers: allUsers.filter(u => u.role === 'provider').length,
    admins: allUsers.filter(u => u.role === 'admin').length,
    blocked: allUsers.filter(u => u.isBlocked).length
  };

  const styles = {
    container: { padding: '20px', maxWidth: '1400px', margin: '0 auto' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '30px' },
    statCard: { background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
    statNumber: { fontSize: '2rem', fontWeight: 800, color: '#6366f1', margin: '0' },
    statLabel: { color: '#64748b', fontSize: '0.85rem', margin: '5px 0 0' },
    toolbar: { display: 'flex', gap: '15px', marginBottom: '20px', background: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
    searchInput: { flex: 1, padding: '10px 15px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem', outline: 'none' },
    select: { padding: '10px 15px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem' },
    table: { width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
    th: { padding: '15px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', textAlign: 'left', fontWeight: 600 },
    td: { padding: '15px', borderBottom: '1px solid #f1f5f9' },
    badge: { padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 },
    btnSm: { padding: '6px 12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', margin: '0 4px' }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Manage Users</h1>
        <p>View, block, or delete user accounts</p>
      </div>
      <div style={styles.container}>
        {/* Stats */}
        <div style={styles.statsGrid}>
          {[
            { label: 'Total Users', value: stats.total },
            { label: 'Customers', value: stats.customers },
            { label: 'Providers', value: stats.providers },
            { label: 'Admins', value: stats.admins },
            { label: 'Blocked', value: stats.blocked, color: '#ef4444' }
          ].map((s, i) => (
            <div key={i} style={styles.statCard}>
              <h3 style={{ ...styles.statNumber, color: s.color || '#6366f1' }}>{s.value}</h3>
              <p style={styles.statLabel}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={styles.toolbar}>
          <div style={{ position: 'relative', flex: 1 }}>
            <FaSearch style={{ position: 'absolute', left: '15px', top: '14px', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...styles.searchInput, paddingLeft: '40px' }}
            />
          </div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={styles.select}>
            <option value="all">All Roles</option>
            <option value="customer">Customers</option>
            <option value="provider">Providers</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        <p style={{ color: '#64748b', marginBottom: '15px' }}>{filteredUsers.length} users found</p>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>User</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Joined</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FaUser />
                      </div>
                      <div>
                        <strong>{user.name}</strong>
                        <br /><small style={{ color: '#64748b' }}>{user.email}</small>
                        {user.isDemo && <span style={{ marginLeft: '8px', padding: '2px 6px', background: '#fbbf24', color: 'white', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>Demo</span>}
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      background: user.role === 'admin' ? '#e0e7ff' : user.role === 'provider' ? '#d1fae5' : '#dbeafe',
                      color: user.role === 'admin' ? '#4f46e5' : user.role === 'provider' ? '#065f46' : '#1e40af'
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      background: user.isBlocked ? '#fee2e2' : '#d1fae5',
                      color: user.isBlocked ? '#991b1b' : '#065f46'
                    }}>
                      {user.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td style={styles.td}>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td style={styles.td}>
                    {user.role !== 'admin' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          style={{ ...styles.btnSm, background: user.isBlocked ? '#10b981' : '#f59e0b', color: 'white' }}
                          onClick={() => handleBlockUser(user._id, user.isDemo, user.isBlocked)}
                        >
                          {user.isBlocked ? <><FaUnlock /> Unblock</> : <><FaBan /> Block</>}
                        </button>
                        <button
                          style={{ ...styles.btnSm, background: '#ef4444', color: 'white' }}
                          onClick={() => handleDeleteUser(user._id, user.isDemo)}
                        >
                          <FaTrash /> Delete
                        </button>
                      </div>
                    )}
                    {user.role === 'admin' && <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Protected</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
            <h3>No users found</h3>
          </div>
        )}
      </div>
    </div>
  );
}