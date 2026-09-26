import mongoose from 'mongoose';

/**
 * BookingNotification
 * Created by admin to alert a customer about their specific booking.
 * Examples: vehicle issues, time changes, cancellations, general notices.
 */
const bookingNotificationSchema = new mongoose.Schema(
  {
    // Which booking this notification is about
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true
    },

    // Customer who should receive this
    customerId: { type: String, required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },

    // Vehicle info (snapshot for display)
    vehicleId: { type: String, required: true },
    vehicleName: { type: String, default: '' },

    // The actual notice message
    message: { type: String, required: true },

    // Category of notice
    type: {
      type: String,
      enum: ['general', 'vehicle_issue', 'time_change', 'cancelled', 'ready'],
      default: 'general'
    },

    // Has the customer read it?
    read: { type: Boolean, default: false },

    // Thread of chat replies
    thread: [{
      sender: { type: String, enum: ['customer', 'admin'] },
      text: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }]
  },
  { timestamps: true }
);

const BookingNotification = mongoose.model('BookingNotification', bookingNotificationSchema);
export default BookingNotification;
