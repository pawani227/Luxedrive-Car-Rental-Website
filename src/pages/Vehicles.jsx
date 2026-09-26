import { useState, useEffect } from 'react';
import { FaSearch, FaFilter } from 'react-icons/fa';
import VehicleCard from '../components/VehicleCard.jsx';
import { fetchVehicles } from '../services/vehicleService.js';

export default function Vehicles() {
  // This page loads all available cars and filters them for the customer.
  const [vehicles, setVehicles] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '', type: '', transmission: '', fuelType: '',
    minPrice: '', maxPrice: '', availability: 'true'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load vehicles from DATABASE
  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchVehicles();
      setVehicles(data);
      setFiltered(data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = [...vehicles];
    
    if (filters.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(v => v.brand.toLowerCase().includes(s) || v.model.toLowerCase().includes(s));
    }
    if (filters.type) result = result.filter(v => (v.category || v.type) === filters.type);
    if (filters.transmission) result = result.filter(v => v.transmission === filters.transmission);
    if (filters.fuelType) result = result.filter(v => v.fuelType === filters.fuelType);
    if (filters.minPrice) result = result.filter(v => v.pricePerDay >= Number(filters.minPrice));
    if (filters.maxPrice) result = result.filter(v => v.pricePerDay <= Number(filters.maxPrice));
    if (filters.availability === 'true') result = result.filter(v => v.available !== false);
    else if (filters.availability === 'false') result = result.filter(v => v.available === false);

    setFiltered(result);
  }, [filters, vehicles]);

  const clear = () => {
    setFilters({ search: '', type: '', transmission: '', fuelType: '', minPrice: '', maxPrice: '', availability: '' });
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const inputStyle = { padding: '10px 15px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', fontFamily: 'Inter, sans-serif', width: '100%' };
  const containerStyle = { maxWidth: '1400px', margin: '0 auto', padding: '0 20px' };

  return (
    <div style={{ paddingBottom: '60px' }}>
      <div className="page-header">
        <h1>Our Vehicles</h1>
        <p>Find and book your perfect rental car from {vehicles.length} vehicles</p>
      </div>

      <div style={containerStyle}>
        {/* Search Bar */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', background: 'white', padding: '15px', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <FaSearch style={{ position: 'absolute', left: '14px', top: '14px', color: '#94a3b8' }} />
            <input
              type="text" name="search" placeholder="Search by brand or model..."
              value={filters.search} onChange={handleFilterChange}
              style={{ ...inputStyle, paddingLeft: '40px' }}
            />
          </div>
          <button className="btn btn-secondary" onClick={() => setShowFilters(!showFilters)}>
            <FaFilter /> Filters
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div style={{ background: 'white', padding: '25px', borderRadius: '14px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '6px', fontSize: '0.85rem' }}>Type</label>
                <select name="type" value={filters.type} onChange={handleFilterChange} style={inputStyle}>
                  <option value="">All</option>
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="electric">Electric</option>
                  <option value="luxury">Luxury</option>
                  <option value="hatchback">Hatchback</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '6px', fontSize: '0.85rem' }}>Transmission</label>
                <select name="transmission" value={filters.transmission} onChange={handleFilterChange} style={inputStyle}>
                  <option value="">All</option>
                  <option value="automatic">Automatic</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '6px', fontSize: '0.85rem' }}>Fuel</label>
                <select name="fuelType" value={filters.fuelType} onChange={handleFilterChange} style={inputStyle}>
                  <option value="">All</option>
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="electric">Electric</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '6px', fontSize: '0.85rem' }}>Min Price</label>
                <input type="number" name="minPrice" value={filters.minPrice} onChange={handleFilterChange} placeholder="0" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '6px', fontSize: '0.85rem' }}>Max Price</label>
                <input type="number" name="maxPrice" value={filters.maxPrice} onChange={handleFilterChange} placeholder="50000" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '6px', fontSize: '0.85rem' }}>Availability</label>
                <select name="availability" value={filters.availability} onChange={handleFilterChange} style={inputStyle}>
                  <option value="">All</option>
                  <option value="true">Available</option>
                  <option value="false">Not Available</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-primary" onClick={() => setFiltered(vehicles.filter(v => {
                let r = true;
                if (filters.type) r = r && (v.category || v.type) === filters.type;
                if (filters.transmission) r = r && v.transmission === filters.transmission;
                if (filters.fuelType) r = r && v.fuelType === filters.fuelType;
                if (filters.minPrice) r = r && v.pricePerDay >= Number(filters.minPrice);
                if (filters.maxPrice) r = r && v.pricePerDay <= Number(filters.maxPrice);
                 if (filters.availability === 'true') r = r && v.available !== false;
                else if (filters.availability === 'false') r = r && v.available === false;

  // Loading state
  if (loading) {
    return (
      <div style={{ paddingBottom: '60px' }}>
        <div className="page-header">
          <h1>Our Vehicles</h1>
          <p>Loading vehicles from database...</p>
        </div>
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{
            border: '4px solid #f1f5f9', borderTop: '4px solid #6366f1',
            borderRadius: '50%', width: '50px', height: '50px',
            animation: 'spin 1s linear infinite', margin: '0 auto'
          }}></div>
          <p style={{ marginTop: '20px', color: '#64748b' }}>Please wait...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ paddingBottom: '60px' }}>
        <div className="page-header">
          <h1>Our Vehicles</h1>
        </div>
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px', maxWidth: '600px', margin: '0 auto' }}>
          <h3 style={{ color: '#dc2626' }}>❌ Error Loading Vehicles</h3>
          <p style={{ color: '#64748b', marginBottom: '20px' }}>{error}</p>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
            ⚠️ Make sure backend server is running on port 5000
          </p>
          <button className="btn btn-primary" onClick={loadVehicles}>🔄 Retry</button>
        </div>
      </div>
    );
  }
                return r;
              }))}>Apply</button>
              <button className="btn btn-secondary" onClick={clear}>Clear</button>
            </div>
          </div>
        )}

        <p style={{ color: '#64748b', marginBottom: '20px' }}>{filtered.length} vehicle{filtered.length !== 1 ? 's' : ''} found</p>

        {filtered.length > 0 ? (
          <div className="vehicles-grid">
            {filtered.map((v) => (
              <VehicleCard key={v._id} vehicle={v} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', background: 'white', borderRadius: '16px' }}>
            <h3 style={{ color: '#1e293b', marginBottom: '10px' }}>No vehicles found</h3>
            <button className="btn btn-primary" onClick={clear}>Clear Filters</button>
          </div>
        )}
      </div>
    </div>
  );
}