import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    // Customer info
    customerId: { type: String, required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, default: '' },

    // Vehicle snapshot (stored at time of booking so history is preserved)
    vehicleId: { type: String, required: true },
    vehicle: {
      brand: { type: String },
      model: { type: String },
      type: { type: String },
      image: { type: String },
      pricePerDay: { type: Number },
      additionalKmPrice: { type: Number },
      includedKmPerDay: { type: Number }
    },

    // Provider info
    providerId: { type: String, default: '' },
    providerName: { type: String, default: '' },

    // Booking details
    startDate: { type: String, required: true },
    pickupTime: { type: String, default: '10:00' },
    endDate: { type: String, required: true },
    returnTime: { type: String, default: '10:00' },
    pickupLocation: { type: String, default: '' },
    dropoffLocation: { type: String, default: '' },
    totalDays: { type: Number, required: true },
    estimatedKm: { type: Number, default: 0 },

    // Pricing breakdown
    includedKm: { type: Number, default: 0 },
    extraKm: { type: Number, default: 0 },
    extraKmCost: { type: Number, default: 0 },
    basePrice: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true },

    // Status
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'rejected', 'cancelled'],
      default: 'pending'
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'unpaid', 'refunded'],
      default: 'paid'
    },

    // Vehicle change request details (requires Admin approval)
    proposedVehicleId: { type: String, default: '' },
    proposedVehicle: {
      brand: { type: String },
      model: { type: String },
      type: { type: String },
      image: { type: String },
      pricePerDay: { type: Number },
      additionalKmPrice: { type: Number },
      includedKmPerDay: { type: Number }
    },
    changeStatus: {
      type: String,
      enum: ['none', 'pending'],
      default: 'none'
    }
  },
  { timestamps: true }
);

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
