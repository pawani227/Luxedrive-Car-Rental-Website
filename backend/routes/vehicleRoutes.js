import express from 'express';
import mongoose from 'mongoose';
import Vehicle from '../models/Vehicle.js';

const defaultVehicles = [
  {
    brand: 'Toyota', model: 'Camry', year: 2024, category: 'sedan',
    pricePerDay: 8500, additionalKmPrice: 75, includedKmPerDay: 100,
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=500&fit=crop',
    seats: 5, transmission: 'automatic', fuelType: 'Hybrid', available: true,
    providerId: 'system', providerName: 'System', providerEmail: 'admin@luxedrive.com'
  },
  {
    brand: 'Honda', model: 'CR-V', year: 2024, category: 'suv',
    pricePerDay: 12000, additionalKmPrice: 100, includedKmPerDay: 120,
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&h=500&fit=crop',
    seats: 7, transmission: 'automatic', fuelType: 'Petrol', available: true,
    providerId: 'system', providerName: 'System', providerEmail: 'admin@luxedrive.com'
  },
  {
    brand: 'Tesla', model: 'Model 3', year: 2024, category: 'electric',
    pricePerDay: 15000, additionalKmPrice: 50, includedKmPerDay: 150,
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=500&fit=crop',
    seats: 5, transmission: 'automatic', fuelType: 'Electric', available: true,
    providerId: 'system', providerName: 'System', providerEmail: 'admin@luxedrive.com'
  },
  {
    brand: 'BMW', model: '5 Series', year: 2024, category: 'luxury',
    pricePerDay: 20000, additionalKmPrice: 150, includedKmPerDay: 100,
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=500&fit=crop',
    seats: 5, transmission: 'automatic', fuelType: 'Diesel', available: true,
    providerId: 'system', providerName: 'System', providerEmail: 'admin@luxedrive.com'
  },
  {
    brand: 'Mazda', model: 'CX-5', year: 2023, category: 'suv',
    pricePerDay: 10500, additionalKmPrice: 85, includedKmPerDay: 110,
    image: 'https://images.unsplash.com/photo-1611859266238-4b98091d9d9b?w=800&h=500&fit=crop',
    seats: 5, transmission: 'automatic', fuelType: 'Petrol', available: true,
    providerId: 'system', providerName: 'System', providerEmail: 'admin@luxedrive.com'
  },
  {
    brand: 'Nissan', model: 'Leaf', year: 2024, category: 'electric',
    pricePerDay: 9500, additionalKmPrice: 45, includedKmPerDay: 130,
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&h=500&fit=crop',
    seats: 5, transmission: 'automatic', fuelType: 'Electric', available: true,
    providerId: 'system', providerName: 'System', providerEmail: 'admin@luxedrive.com'
  },
  {
    brand: 'Mercedes-Benz', model: 'E-Class', year: 2024, category: 'luxury',
    pricePerDay: 22000, additionalKmPrice: 175, includedKmPerDay: 100,
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=500&fit=crop',
    seats: 5, transmission: 'automatic', fuelType: 'Diesel', available: true,
    providerId: 'system', providerName: 'System', providerEmail: 'admin@luxedrive.com'
  },
  {
    brand: 'Hyundai', model: 'Tucson', year: 2023, category: 'suv',
    pricePerDay: 9000, additionalKmPrice: 70, includedKmPerDay: 100,
    image: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&h=500&fit=crop',
    seats: 5, transmission: 'automatic', fuelType: 'Petrol', available: true,
    providerId: 'system', providerName: 'System', providerEmail: 'admin@luxedrive.com'
  }
];

const seedVehicles = async () => {
  try {
    const count = await Vehicle.countDocuments();
    if (count === 0) {
      await Vehicle.insertMany(defaultVehicles);
      console.log('✅ Default vehicles seeded in MongoDB successfully');
    }
  } catch (err) {
    console.error('❌ Seeding default vehicles failed:', err.message);
  }
};

// Seed vehicles when connection is ready
mongoose.connection.once('open', seedVehicles);
if (mongoose.connection.readyState === 1) {
  seedVehicles();
}

const router = express.Router();

// CREATE
router.post('/', async (req, res) => {
  try {
    const newVehicle = await Vehicle.create(req.body);
    res.status(201).json({ success: true, message: 'Vehicle added successfully', data: newVehicle });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// READ ALL
router.get('/', async (req, res) => {
  try {
    const vehicles = await Vehicle.find().sort({ createdAt: -1 });
    res.json({ success: true, count: vehicles.length, data: vehicles });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// READ ONE
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    res.json({ success: true, data: vehicle });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// UPDATE
router.put('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    res.json({ success: true, message: 'Vehicle updated successfully', data: vehicle });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    res.json({ success: true, message: 'Vehicle deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

export default router;