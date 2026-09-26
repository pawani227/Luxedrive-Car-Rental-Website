import express from 'express';
import BookingNotification from '../models/BookingNotification.js';

const router = express.Router();

// ==================== SEND NOTIFICATION (Admin) ====================
// POST /api/notifications
// Admin sends a custom notice to a customer about their booking
router.post('/', async (req, res) => {
  try {
    const {
      bookingId, customerId, customerName, customerEmail,
      vehicleId, vehicleName, message, type
    } = req.body;

    if (!bookingId || !customerId || !message) {
      return res.status(400).json({
        success: false,
        message: 'bookingId, customerId, and message are required'
      });
    }

    const notification = await BookingNotification.create({
      bookingId, customerId, customerName, customerEmail,
      vehicleId, vehicleName,
      message,
      type: type || 'general'
    });

    res.status(201).json({ success: true, data: notification });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ==================== GET NOTIFICATIONS FOR A CUSTOMER ====================
// GET /api/notifications/customer/:customerId
router.get('/customer/:customerId', async (req, res) => {
  try {
    const notifications = await BookingNotification.find({
      customerId: req.params.customerId
    }).sort({ createdAt: -1 });

    res.json({ success: true, count: notifications.length, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ==================== GET NOTIFICATIONS FOR A SPECIFIC BOOKING ====================
// GET /api/notifications/booking/:bookingId
router.get('/booking/:bookingId', async (req, res) => {
  try {
    const notifications = await BookingNotification.find({
      bookingId: req.params.bookingId
    }).sort({ createdAt: -1 });

    res.json({ success: true, count: notifications.length, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ==================== GET ALL NOTIFICATIONS (Admin view) ====================
// GET /api/notifications
router.get('/', async (req, res) => {
  try {
    const notifications = await BookingNotification.find().sort({ createdAt: -1 });
    res.json({ success: true, count: notifications.length, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ==================== MARK AS READ ====================
// PUT /api/notifications/:id/read
router.put('/:id/read', async (req, res) => {
  try {
    const notification = await BookingNotification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json({ success: true, data: notification });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ==================== DELETE NOTIFICATION (Admin) ====================
// DELETE /api/notifications/:id
router.delete('/:id', async (req, res) => {
  try {
    const notification = await BookingNotification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json({ success: true, message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ==================== REPLY TO NOTIFICATION ====================
// PUT /api/notifications/:id/reply
router.put('/:id/reply', async (req, res) => {
  try {
    const { sender, text } = req.body;
    if (!sender || !text) {
      return res.status(400).json({ success: false, message: 'sender and text are required' });
    }

    const notification = await BookingNotification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    notification.thread = notification.thread || [];
    notification.thread.push({ sender, text, timestamp: new Date() });

    // If admin replies, make it unread for the customer
    if (sender === 'admin') {
      notification.read = false;
    }

    await notification.save();
    res.json({ success: true, data: notification });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

export default router;
