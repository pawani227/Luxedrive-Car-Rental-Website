import mongoose from 'mongoose';

const delayReportSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    reason: { type: String, required: true },
    vehicleDetails: { type: String, required: true },
    thread: [{
      sender: { type: String, enum: ['customer', 'admin'] },
      text: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }],
    status: {
      type: String,
      enum: ['pending', 'resolved'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

const DelayReport = mongoose.model('DelayReport', delayReportSchema);
export default DelayReport;
