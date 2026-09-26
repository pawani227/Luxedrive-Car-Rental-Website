import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { addVehicle } from '../services/vehicleService.js';
import { FaCar, FaImage, FaDollarSign, FaRoad, FaCogs, FaGasPump, FaUsers, FaCalendarAlt, FaPalette, FaIdCard, FaUpload, FaTachometerAlt, FaTools } from 'react-icons/fa';

export default function AddVehicle() {
  // This page lets providers add a new vehicle to the rental system.
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    brand: '', model: '', year: new Date().getFullYear(), type: 'sedan',
    pricePerDay: '', additionalKmPrice: '', includedKmPerDay: '100',
    seats: '4', transmission: 'automatic', fuelType: 'petrol',
    color: '', plateNumber: '', features: '', description: '', imageUrl: '',
    // NEW: Vehicle condition fields
    fuelLevel: '', odometer: '', lastServiceDate: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // ✅ Compress image before storing as base64
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas to resize image
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;  // Max width
        const MAX_HEIGHT = 800;  // Max height
        let width = img.width;
        let height = img.height;

        // Resize logic
        if (width > MAX_WIDTH) {
          height = (height * MAX_WIDTH) / width;
          width = MAX_WIDTH;
        }
        if (height > MAX_HEIGHT) {
          width = (width * MAX_HEIGHT) / height;
          height = MAX_HEIGHT;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to base64 with reduced quality (0.8 = 80% quality)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        setImagePreview(compressedBase64);
        setImageFile(file);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };


    // ✅ CHANGED: Save to DATABASE instead of localStorage
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const finalImage = imagePreview || formData.imageUrl || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=500&fit=crop';

      const newVehicle = {
        brand: formData.brand,
        model: formData.model,
        year: Number(formData.year),
        category: formData.type,
        pricePerDay: Number(formData.pricePerDay),
        seats: Number(formData.seats),
        transmission: formData.transmission,
        fuelType: formData.fuelType.charAt(0).toUpperCase() + formData.fuelType.slice(1),
        image: finalImage,
        available: true,
        location: 'Colombo',
        additionalKmPrice: Number(formData.additionalKmPrice) || 0,
        includedKmPerDay: Number(formData.includedKmPerDay) || 100,
        color: formData.color,
        plateNumber: formData.plateNumber,
        features: formData.features,
        description: formData.description,
        fuelLevel: formData.fuelLevel,
        odometer: formData.odometer ? Number(formData.odometer) : 0,
        lastServiceDate: formData.lastServiceDate,
        providerId: user?._id || '',
        providerName: user?.name || '',
        providerEmail: user?.email || ''
      };

      // ✅ Save to DATABASE
      await addVehicle(newVehicle);
      
      alert('✅ Vehicle added successfully to database!');
      navigate('/provider/dashboard');
    } catch (err) {
      alert('❌ Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px', border: '2px solid #e2e8f0', borderRadius: '10px',
    fontSize: '0.95rem', outline: 'none', fontFamily: 'Inter, sans-serif'
  };

  const labelStyle = {
    fontWeight: 600, color: '#334155', marginBottom: '8px', fontSize: '0.9rem',
    display: 'flex', alignItems: 'center', gap: '8px'
  };

  const sectionStyle = {
    marginBottom: '35px', paddingBottom: '25px', borderBottom: '2px solid #f1f5f9'
  };

  const sectionTitle = {
    fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', marginBottom: '20px',
    display: 'flex', alignItems: 'center', gap: '10px'
  };

  return (
    <div style={{ paddingBottom: '15px' }}>
      <div className="page-header">
        <h1>Add New Vehicle</h1>
        <p>List your vehicle for rental and start earning!</p>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <form onSubmit={handleSubmit}>

            {/* Basic Info */}
            <div style={sectionStyle}>
              <h3 style={sectionTitle}><FaCar style={{ color: '#6366f1' }} /> Basic Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={labelStyle}>Brand *</label>
                  <input type="text" name="brand" value={formData.brand} onChange={handleChange} placeholder="e.g., Toyota" style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>Model *</label>
                  <input type="text" name="model" value={formData.model} onChange={handleChange} placeholder="e.g., Camry" style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}><FaCalendarAlt /> Year *</label>
                  <input type="number" name="year" value={formData.year} onChange={handleChange} min="2000" max="2025" style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>Vehicle Type *</label>
                  <select name="type" value={formData.type} onChange={handleChange} style={inputStyle}>
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="hatchback">Hatchback</option>
                    <option value="van">Van</option>
                    <option value="luxury">Luxury</option>
                    <option value="electric">Electric</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}><FaPalette /> Color</label>
                  <input type="text" name="color" value={formData.color} onChange={handleChange} placeholder="e.g., Silver" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}><FaIdCard /> Plate Number</label>
                  <input type="text" name="plateNumber" value={formData.plateNumber} onChange={handleChange} placeholder="e.g., ABC-1234" style={inputStyle} />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div style={sectionStyle}>
              <h3 style={sectionTitle}><FaDollarSign style={{ color: '#6366f1' }} /> Pricing</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={labelStyle}>Daily Price (LKR) *</label>
                  <input type="number" name="pricePerDay" value={formData.pricePerDay} onChange={handleChange} placeholder="e.g., 5000" style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}><FaRoad /> Included KM/day *</label>
                  <input type="number" name="includedKmPerDay" value={formData.includedKmPerDay} onChange={handleChange} style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}><FaRoad /> Extra KM Price (LKR) *</label>
                  <input type="number" name="additionalKmPrice" value={formData.additionalKmPrice} onChange={handleChange} placeholder="e.g., 50" style={inputStyle} required />
                </div>
              </div>
            </div>

            {/* Specs */}
            <div style={sectionStyle}>
              <h3 style={sectionTitle}><FaCogs style={{ color: '#6366f1' }} /> Specifications</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={labelStyle}><FaUsers /> Seats</label>
                  <select name="seats" value={formData.seats} onChange={handleChange} style={inputStyle}>
                    {[2, 4, 5, 7, 8].map(n => <option key={n} value={n}>{n} Seats</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}><FaCogs /> Transmission</label>
                  <select name="transmission" value={formData.transmission} onChange={handleChange} style={inputStyle}>
                    <option value="automatic">Automatic</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}><FaGasPump /> Fuel Type</label>
                  <select name="fuelType" value={formData.fuelType} onChange={handleChange} style={inputStyle}>
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Electric</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ===== NEW: Vehicle Condition ===== */}
            <div style={sectionStyle}>
              <h3 style={sectionTitle}><FaTools style={{ color: '#6366f1' }} /> Vehicle Condition</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={labelStyle}><FaGasPump /> Current Fuel Level</label>
                  <select name="fuelLevel" value={formData.fuelLevel} onChange={handleChange} style={inputStyle}>
                    <option value="">Select level</option>
                    <option value="Empty">Empty</option>
                    <option value="25%">25% (Quarter)</option>
                    <option value="50%">50% (Half)</option>
                    <option value="75%">75% (Three Quarter)</option>
                    <option value="Full">Full</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}><FaTachometerAlt /> Odometer Reading (km)</label>
                  <input type="number" name="odometer" value={formData.odometer} onChange={handleChange} placeholder="e.g., 45000" min="0" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}><FaTools /> Last Service Date</label>
                  <input type="date" name="lastServiceDate" value={formData.lastServiceDate} onChange={handleChange} max={new Date().toISOString().split('T')[0]} style={inputStyle} />
                </div>
              </div>
            </div>

            {/* Details */}
            <div style={sectionStyle}>
              <h3 style={sectionTitle}>Additional Details</h3>
              <div style={{ marginBottom: '15px' }}>
                <label style={labelStyle}>Features</label>
                <input type="text" name="features" value={formData.features} onChange={handleChange} placeholder="e.g., AC, GPS, Bluetooth, Sunroof" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="3" placeholder="Describe your vehicle..." style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
            </div>

            {/* Image Upload Section */}
            <div style={{sectionStyle, marginBottom: '20px', paddingBottom: '0', borderBottom: 'none' }}>
              <h3 style={sectionTitle}><FaImage style={{ color: '#6366f1' }} /> Vehicle Photo</h3>

              {/* File Upload Button */}
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}><FaUpload /> Upload from Computer</label>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    padding: '14px 24px', border: '2px dashed #6366f1', borderRadius: '12px',
                    background: '#eef2ff', cursor: 'pointer', width: '100%',
                    fontSize: '1rem', color: '#6366f1', fontWeight: 600, fontFamily: 'Inter, sans-serif'
                  }}
                >
                  <FaUpload /> Click to Upload Photo
                </button>
              </div>

              {/* OR URL Input */}
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Or paste Image URL</label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => {
                    setFormData({ ...formData, imageUrl: e.target.value });
                    setImagePreview(e.target.value);
                    setImageFile(null);
                  }}
                  placeholder="https://example.com/car-image.jpg"
                  style={inputStyle}
                />
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                  <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                  <p style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600, marginTop: '8px' }}>✓ Photo ready</p>
                </div>
              )}

              
            </div>

            {/* Submit Buttons */}
            <div style={{ display: 'flex', gap: '15px' }}>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                <FaCar /> {loading ? 'Adding...' : 'Add Vehicle'}
              </button>
              <button type="button" className="btn btn-secondary btn-full" onClick={() => navigate('/provider/dashboard')}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}