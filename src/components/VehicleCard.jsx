import { Link } from 'react-router-dom';
import { FaGasPump, FaCogs, FaUsers, FaCalendarAlt, FaLock } from 'react-icons/fa';
import './VehicleCard.css';

export default function VehicleCard({ vehicle }) {
  const img = vehicle.image || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=500&fit=crop';
  const isAvailable = vehicle.available !== false && vehicle.availability !== false;

  return (
    <div className={`vehicle-card ${!isAvailable ? 'vehicle-card--booked' : ''}`}>
      <div className="vehicle-card-image">
        <img src={img} alt={`${vehicle.brand} ${vehicle.model}`} />

        {/* Availability badge */}
        <span className={`avail-badge ${isAvailable ? 'available' : 'unavailable'}`}>
          {isAvailable ? 'Available' : 'Booked'}
        </span>

        <span className="type-badge">{vehicle.category || vehicle.type}</span>

        {/* Full overlay when booked */}
        {!isAvailable && (
          <div className="booked-overlay">
            <FaLock className="booked-lock-icon" />
            <span className="booked-overlay-text">BOOKED</span>
            <p className="booked-overlay-sub">Currently Unavailable</p>
          </div>
        )}
      </div>

      <div className="vehicle-card-body">
        <h3>{vehicle.brand} {vehicle.model}</h3>
        <div className="vehicle-specs">
          <span><FaCalendarAlt /> {vehicle.year}</span>
          <span><FaUsers /> {vehicle.seats} seats</span>
          <span><FaCogs /> {vehicle.transmission}</span>
          <span><FaGasPump /> {vehicle.fuelType}</span>
        </div>
        <div className="vehicle-card-footer">
          <div className="price">
            <span className="price-amount">LKR {vehicle.pricePerDay?.toLocaleString()}</span>
            <span className="price-period">/day</span>
          </div>
          {isAvailable ? (
            <Link to={`/vehicles/${vehicle._id}`} className="btn btn-primary btn-sm">
              View Details
            </Link>
          ) : (
            <button className="btn btn-booked btn-sm" disabled>
              <FaLock /> Booked
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
