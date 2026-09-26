import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    brand: { type: String, required: [true, 'Brand is required'], trim: true },
    model: { type: String, required: [true, 'Model is required'], trim: true },
    year: { type: Number, required: [true, 'Year is required'], min: 1900, max: new Date().getFullYear() + 1 },
    category: { type: String, required: true, enum: ['sedan', 'suv', 'luxury', 'hatchback', 'electric', 'van'], lowercase: true },
    seats: { type: Number, required: [true, 'Seats is required'], min: 2, max: 15 },
    transmission: { type: String, required: true, enum: ['automatic', 'manual'] },
    fuelType: { type: String, required: true, enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'] },
    pricePerDay: { type: Number, required: [true, 'Price per day is required'], min: 0 },
    image: { type: String, required: [true, 'Image URL is required'] },
    available: { type: Boolean, default: true },
    location: { type: String, default: 'Colombo' },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    // Extra fields from your existing form
    additionalKmPrice: { type: Number, default: 0 },
    includedKmPerDay: { type: Number, default: 100 },
    color: { type: String, default: '' },
    plateNumber: { type: String, default: '' },
    features: { type: String, default: '' },
    description: { type: String, default: '' },
    fuelLevel: { type: String, default: '' },
    odometer: { type: Number, default: 0 },
    lastServiceDate: { type: String, default: '' },
    // Provider info
    providerId: { type: String, default: '' },
    providerName: { type: String, default: '' },
    providerEmail: { type: String, default: '' }
  },
  { timestamps: true }
);

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
export default Vehicle;