import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { FaCar } from 'react-icons/fa';
import { fetchVehicleById, updateVehicle } from '../services/vehicleService.js';  
import './AddVehicle.css';

export default function EditVehicle() {
  // This page updates an existing vehicle listing for the provider.
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    brand: '', model: '', year: 2024, type: 'sedan',
    pricePerDay: '', additionalKmPrice: '', includedKmPerDay: '100',
    seats: '5', transmission: 'automatic', fuelType: 'petrol',
    color: '', plateNumber: '', features: '', description: '',
    imageUrl: '', available: true
  });

    useEffect(() => {
    const loadVehicleData = async () => {
      try {
        const vehicle = await fetchVehicleById(id);
        if (vehicle) {
          setFormData({
            brand: vehicle.brand || '',
            model: vehicle.model || '',
            year: vehicle.year || 2024,
            type: vehicle.category || vehicle.type || 'sedan',
            pricePerDay: vehicle.pricePerDay || '',
            additionalKmPrice: vehicle.additionalKmPrice || '',
            includedKmPerDay: vehicle.includedKmPerDay || '100',
            seats: String(vehicle.seats || 5),
            transmission: vehicle.transmission || 'automatic',
            fuelType: (vehicle.fuelType || 'petrol').toLowerCase(),
            color: vehicle.color || '',
            plateNumber: vehicle.plateNumber || '',
            features: vehicle.features || '',
            description: vehicle.description || '',
            imageUrl: vehicle.image || '',
            available: vehicle.available !== false
          });
        }
      } catch (err) {
        alert('❌ Error loading vehicle: ' + err.message);
        navigate('/provider/dashboard');
      }
    };
    loadVehicleData();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

    // ✅ CHANGED: Update DATABASE instead of localStorage
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedData = {
        brand: formData.brand,
        model: formData.model,
        year: Number(formData.year),
        category: formData.type,
        pricePerDay: Number(formData.pricePerDay),
        seats: Number(formData.seats),
        transmission: formData.transmission,
        fuelType: formData.fuelType.charAt(0).toUpperCase() + formData.fuelType.slice(1),
        image: formData.imageUrl,
        additionalKmPrice: Number(formData.additionalKmPrice) || 0,
        includedKmPerDay: Number(formData.includedKmPerDay) || 100,
        color: formData.color,
        plateNumber: formData.plateNumber,
        features: formData.features,
        description: formData.description,
        available: formData.available === true || formData.available === 'true'
      };

      await updateVehicle(id, updatedData);
      alert('✅ Vehicle updated successfully in database!');
      navigate('/provider/dashboard');
    } catch (err) {
      alert('❌ Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="form-page">
      <div className="page-header">
        <h1>Edit Vehicle</h1>
        <p>Update your vehicle information</p>
      </div>
      <div className="container">
        <div className="form-card">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Brand *</label>
                <input type="text" name="brand" value={formData.brand} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Model *</label>
                <input type="text" name="model" value={formData.model} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Year *</label>
                <input type="number" name="year" value={formData.year} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Type *</label>
                <select name="type" value={formData.type} onChange={handleChange}>
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="luxury">Luxury</option>
                  <option value="electric">Electric</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Daily Price (LKR) *</label>
                <input type="number" name="pricePerDay" value={formData.pricePerDay} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Included KM/Day *</label>
                <input type="number" name="includedKmPerDay" value={formData.includedKmPerDay} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-group">
              <label>Extra KM Price (LKR/km) *</label>
              <input type="number" name="additionalKmPrice" value={formData.additionalKmPrice} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Availability</label>
              <select name="available" value={String(formData.available)} onChange={handleChange}>
                <option value="true">Available</option>
                <option value="false">Not Available</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}><FaCar /> {loading ? 'Updating...' : 'Update Vehicle'}</button>
              <button type="button" className="btn btn-secondary btn-full" onClick={() => navigate('/provider/dashboard')}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}