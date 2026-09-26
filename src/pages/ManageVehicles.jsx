import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaTrash, FaEye, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { fetchVehicles, updateVehicle, deleteVehicle } from '../services/vehicleService.js';

export default function ManageVehicles() {
  // Admin page to manage the full vehicle catalog.
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Load vehicles from database
  const load = async () => {
    try {
      const data = await fetchVehicles();
      setVehicles(data || []);
    } catch (err) {
      console.error('Failed to load vehicles:', err);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  const filtered = vehicles.filter(v =>
    `${v.brand} ${v.model}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vehicle?')) return;
    try {
      await deleteVehicle(id);
      alert('Deleted!');
      load();
    } catch (err) {
      alert('Failed to delete vehicle: ' + err.message);
    }
  };

  const startEdit = (vehicle) => {
    setEditingId(vehicle._id);
    setEditForm({ ...vehicle });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    try {
      const updatedData = {
        brand: editForm.brand,
        model: editForm.model,
        year: Number(editForm.year),
        category: editForm.category || editForm.type,
        pricePerDay: Number(editForm.pricePerDay),
        additionalKmPrice: Number(editForm.additionalKmPrice),
        includedKmPerDay: Number(editForm.includedKmPerDay),
        seats: Number(editForm.seats),
        transmission: editForm.transmission,
        fuelType: editForm.fuelType
      };
      await updateVehicle(editingId, updatedData);
      setEditingId(null);
      alert('Vehicle updated! Changes will reflect across all pages.');
      load();
    } catch (err) {
      alert('Failed to update vehicle: ' + err.message);
    }
  };

  const handleToggleAvailability = async (id) => {
    const v = vehicles.find(x => x._id === id);
    if (!v) return;
    const currentAvailable = v.available !== false;
    try {
      await updateVehicle(id, { available: !currentAvailable });
      load();
    } catch (err) {
      alert('Failed to toggle availability: ' + err.message);
    }
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const inputStyle = {
    width: '80px', padding: '6px 10px', border: '2px solid #6366f1', borderRadius: '6px',
    fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', outline: 'none'
  };

  const selectStyle = {
    padding: '6px 10px', border: '2px solid #6366f1', borderRadius: '6px',
    fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', cursor: 'pointer'
  };

  const stats = {
    total: vehicles.length,
    available: vehicles.filter(v => v.available !== false).length
  };

  const containerStyle = { maxWidth: '1400px', margin: '0 auto', padding: '0 20px' };
  const toolbarStyle = { display: 'flex', gap: '15px', marginBottom: '20px', background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' };

  return (
    <div style={{ paddingBottom: '20px' }}>
      <div className="page-header">
        <h1>Manage Vehicles</h1>
        <p>Monitor, edit prices, or delete vehicle listings</p>
      </div>

      <div style={containerStyle}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ background: 'white', padding: '22px', borderRadius: '14px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#6366f1', margin: '0 0 5px' }}>{stats.total}</h3>
            <p style={{ color: '#64748b', margin: 0 }}>Total Vehicles</p>
          </div>
          <div style={{ background: 'white', padding: '22px', borderRadius: '14px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', margin: '0 0 5px' }}>{stats.available}</h3>
            <p style={{ color: '#64748b', margin: 0 }}>Available</p>
          </div>
          <div style={{ background: 'white', padding: '22px', borderRadius: '14px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#ef4444', margin: '0 0 5px' }}>{stats.total - stats.available}</h3>
            <p style={{ color: '#64748b', margin: 0 }}>Unavailable</p>
          </div>
        </div>

        {/* Search */}
        <div style={toolbarStyle}>
          <div style={{ flex: 1, position: 'relative' }}>
            <FaSearch style={{ position: 'absolute', left: '15px', top: '14px', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search vehicles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '12px 15px 12px 40px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '0.95rem', outline: 'none', fontFamily: 'Inter, sans-serif' }}
            />
          </div>
        </div>

        <p style={{ color: '#64748b', marginBottom: '15px' }}>{filtered.length} vehicles found</p>

        {/* Vehicles Table */}
        <div style={{ overflowX: 'auto', background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white' }}>
                <th style={{ padding: '16px 12px', textAlign: 'left' }}>Vehicle</th>
                <th style={{ padding: '16px 12px', textAlign: 'left' }}>Provider</th>
                <th style={{ padding: '16px 12px', textAlign: 'left' }}>Daily Price (LKR)</th>
                <th style={{ padding: '16px 12px', textAlign: 'left' }}>Extra KM (LKR)</th>
                <th style={{ padding: '16px 12px', textAlign: 'left' }}>Included KM</th>
                <th style={{ padding: '16px 12px', textAlign: 'left' }}>Seats</th>
                <th style={{ padding: '16px 12px', textAlign: 'left' }}>Trans.</th>
                <th style={{ padding: '16px 12px', textAlign: 'left' }}>Fuel</th>
                <th style={{ padding: '16px 12px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '16px 12px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px' }}>
                    {editingId === v._id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <input name="brand" value={editForm.brand} onChange={handleEditChange} style={{ ...inputStyle, width: '100px' }} />
                        <input name="model" value={editForm.model} onChange={handleEditChange} style={{ ...inputStyle, width: '100px' }} />
                        <input name="year" value={editForm.year} onChange={handleEditChange} style={{ ...inputStyle, width: '80px' }} />
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={v.image} alt={v.brand} style={{ width: '50px', height: '35px', objectFit: 'cover', borderRadius: '6px' }} />
                        <div>
                          <strong style={{ fontSize: '0.9rem', color: '#1e293b' }}>{v.brand} {v.model}</strong>
                          <br /><small style={{ color: '#94a3b8' }}>{v.year}</small>
                        </div>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px', fontSize: '0.85rem', color: '#475569' }}>{v.providerName || v.provider || 'System'}</td>
                  <td style={{ padding: '12px' }}>
                    {editingId === v._id ? (
                      <input name="pricePerDay" type="number" value={editForm.pricePerDay} onChange={handleEditChange} style={inputStyle} />
                    ) : (
                      <span style={{ fontWeight: 700, color: '#6366f1', cursor: 'pointer' }} onClick={() => startEdit(v)}>
                        {v.pricePerDay?.toLocaleString()} <FaEdit size={10} style={{ marginLeft: '4px', color: '#94a3b8' }} />
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {editingId === v._id ? (
                      <input name="additionalKmPrice" type="number" value={editForm.additionalKmPrice} onChange={handleEditChange} style={inputStyle} />
                    ) : (
                      <span>{v.additionalKmPrice || 0}</span>
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {editingId === v._id ? (
                      <input name="includedKmPerDay" type="number" value={editForm.includedKmPerDay} onChange={handleEditChange} style={inputStyle} />
                    ) : (
                      <span>{v.includedKmPerDay || 100} km</span>
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {editingId === v._id ? (
                      <select name="seats" value={editForm.seats} onChange={handleEditChange} style={selectStyle}>
                        {[2,4,5,7,8].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    ) : (
                      <span>{v.seats}</span>
                    )}
                  </td>
                  <td style={{ padding: '12px', textTransform: 'capitalize' }}>
                    {editingId === v._id ? (
                      <select name="transmission" value={editForm.transmission} onChange={handleEditChange} style={selectStyle}>
                        <option value="automatic">Auto</option>
                        <option value="manual">Manual</option>
                      </select>
                    ) : (
                      <span>{v.transmission}</span>
                    )}
                  </td>
                  <td style={{ padding: '12px', textTransform: 'capitalize' }}>
                    {editingId === v._id ? (
                      <select name="fuelType" value={editForm.fuelType} onChange={handleEditChange} style={selectStyle}>
                        <option value="petrol">Petrol</option>
                        <option value="diesel">Diesel</option>
                        <option value="electric">Electric</option>
                        <option value="hybrid">Hybrid</option>
                      </select>
                    ) : (
                      <span>{v.fuelType}</span>
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <button
                      onClick={() => handleToggleAvailability(v._id)}
                      style={{
                        padding: '4px 12px', borderRadius: '999px', border: 'none', cursor: 'pointer',
                        fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
                        background: v.available !== false ? '#d1fae5' : '#fee2e2',
                        color: v.available !== false ? '#065f46' : '#991b1b'
                      }}
                    >
                      {v.available !== false ? 'Available' : 'Unavailable'}
                    </button>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {editingId === v._id ? (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={saveEdit} style={{ padding: '6px 12px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: '#10b981', color: 'white', fontWeight: 600 }}>
                          <FaSave /> Save
                        </button>
                        <button onClick={cancelEdit} style={{ padding: '6px 12px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: '#ef4444', color: 'white', fontWeight: 600 }}>
                          <FaTimes /> Cancel
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => startEdit(v)} style={{ padding: '6px 10px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: '#6366f1', color: 'white', fontSize: '0.8rem' }}>
                          <FaEdit /> Edit
                        </button>
                        <button onClick={() => handleDelete(v._id)} style={{ padding: '6px 10px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: '#ef4444', color: 'white', fontSize: '0.8rem' }}>
                          <FaTrash /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
            <h3>No vehicles found</h3>
          </div>
        )}
      </div>
    </div>
  );
}