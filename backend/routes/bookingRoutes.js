import express from 'express';
import Booking from '../models/Booking.js';
import Vehicle from '../models/Vehicle.js';
import { sendBookingApprovalEmail } from '../utils/emailService.js';

const router = express.Router();

// ==================== CREATE BOOKING ====================
// POST /api/bookings
// Validates date availability instead of locking the vehicle completely
router.post('/', async (req, res) => {
  try {
    const { vehicleId, startDate, endDate } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    // Check manual override (if provider/admin marked the vehicle as unavailable)
    if (vehicle.available === false) {
      return res.status(400).json({ success: false, message: 'This vehicle is currently not available for rent.' });
    }

    // Initial coarse check for overlapping dates
    const potentialOverlaps = await Booking.find({
      vehicleId,
      status: { $in: ['pending', 'confirmed'] },
      startDate: { $lte: endDate },
      endDate: { $gte: startDate }
    });

    // Precise time overlap validation in memory
    const reqStart = new Date(`${startDate}T${req.body.pickupTime || '00:00'}`);
    const reqEnd = new Date(`${endDate}T${req.body.returnTime || '23:59'}`);

    const hasOverlap = potentialOverlaps.some(b => {
      const bStart = new Date(`${b.startDate}T${b.pickupTime || '00:00'}`);
      const bEnd = new Date(`${b.endDate}T${b.returnTime || '23:59'}`);
      // Overlap condition: reqStart < bEnd AND reqEnd > bStart
      return reqStart < bEnd && reqEnd > bStart;
    });

    if (hasOverlap) {
      return res.status(400).json({
        success: false,
        message: 'This vehicle is already booked for the selected time period. Please choose different dates or times.'
      });
    }

    // Create booking
    const newBooking = await Booking.create(req.body);

    res.status(201).json({ success: true, message: 'Booking created successfully', data: newBooking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ==================== GET ACTIVE BOOKINGS BY VEHICLE ====================
// GET /api/bookings/vehicle/:vehicleId
// Returns only the booked dates for the frontend calendar/warning
router.get('/vehicle/:vehicleId', async (req, res) => {
  try {
    const bookings = await Booking.find({
      vehicleId: req.params.vehicleId,
      status: { $in: ['pending', 'confirmed'] }
    }).select('startDate endDate pickupTime returnTime status');
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ==================== GET ALL BOOKINGS (Admin) ====================
// GET /api/bookings
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ==================== GET BOOKINGS BY CUSTOMER ====================
// GET /api/bookings/customer/:customerId
router.get('/customer/:customerId', async (req, res) => {
  try {
    const bookings = await Booking.find({ customerId: req.params.customerId }).sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ==================== GET BOOKINGS BY PROVIDER ====================
// GET /api/bookings/provider/:providerId
router.get('/provider/:providerId', async (req, res) => {
  try {
    const bookings = await Booking.find({ providerId: req.params.providerId }).sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ==================== GET ADMIN STATS ====================
// GET /api/bookings/stats
router.get('/stats', async (req, res) => {
  try {
    const all = await Booking.find();
    const stats = {
      total: all.length,
      pending: all.filter(b => b.status === 'pending').length,
      confirmed: all.filter(b => b.status === 'confirmed').length,
      completed: all.filter(b => b.status === 'completed').length,
      rejected: all.filter(b => b.status === 'rejected').length,
      cancelled: all.filter(b => b.status === 'cancelled').length,
      revenue: all.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.totalPrice, 0)
    };
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ==================== UPDATE BOOKING STATUS ====================
// PUT /api/bookings/:id/status
// - If 'confirmed': send approval email to customer
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'completed', 'rejected', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // ── Approved → send email ──────────────────────────────────
    if (status === 'confirmed') {
      sendBookingApprovalEmail(
        booking.customerEmail,
        booking.customerName,
        {
          vehicle: booking.vehicle,
          startDate: booking.startDate,
          pickupTime: booking.pickupTime,
          endDate: booking.endDate,
          returnTime: booking.returnTime,
          totalDays: booking.totalDays,
          totalPrice: booking.totalPrice
        }
      );
    }

    res.json({ success: true, message: 'Status updated', data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ==================== UPDATE BOOKING TIME (Admin/Delay) ====================
// PUT /api/bookings/:id/time
router.put('/:id/time', async (req, res) => {
  try {
    const { endDate, returnTime } = req.body;
    
    if (!endDate || !returnTime) {
      return res.status(400).json({ success: false, message: 'endDate and returnTime are required' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    booking.endDate = endDate;
    booking.returnTime = returnTime;

    // Optional: Recalculate price if days changed. For simplicity we skip or do basic update.
    const start = new Date(`${booking.startDate}T${booking.pickupTime || '00:00'}`);
    const end = new Date(`${endDate}T${returnTime}`);
    const msInDay = 1000 * 60 * 60 * 24;
    // Round up the days or just set totalDays
    const newTotalDays = Math.max(1, Math.ceil((end - start) / msInDay));
    booking.totalDays = newTotalDays;
    
    // Simple price recalc based on base price per day (extra km is handled separately)
    booking.basePrice = newTotalDays * booking.vehicle.pricePerDay;
    booking.totalPrice = booking.basePrice + booking.extraKmCost;

    await booking.save();

    res.json({ success: true, message: 'Booking time extended successfully', data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ==================== DELETE BOOKING (Admin) ====================
// DELETE /api/bookings/:id
router.delete('/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    res.json({ success: true, message: 'Booking deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ==================== REQUEST VEHICLE CHANGE (Customer) ====================
// PUT /api/bookings/:id/request-change
router.put('/:id/request-change', async (req, res) => {
  try {
    const { vehicleId } = req.body;
    if (!vehicleId) {
      return res.status(400).json({ success: false, message: 'Proposed vehicleId is required' });
    }

    const proposedVehicle = await Vehicle.findById(vehicleId);
    if (!proposedVehicle) {
      return res.status(404).json({ success: false, message: 'Proposed vehicle not found' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Update proposed changes
    booking.proposedVehicleId = vehicleId;
    booking.proposedVehicle = {
      brand: proposedVehicle.brand,
      model: proposedVehicle.model,
      type: proposedVehicle.type,
      image: proposedVehicle.image,
      pricePerDay: proposedVehicle.pricePerDay,
      additionalKmPrice: proposedVehicle.additionalKmPrice,
      includedKmPerDay: proposedVehicle.includedKmPerDay
    };
    booking.changeStatus = 'pending';

    await booking.save();
    res.json({ success: true, message: 'Vehicle change request submitted to admin', data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ==================== APPROVE VEHICLE CHANGE (Admin) ====================
// PUT /api/bookings/:id/approve-change
router.put('/:id/approve-change', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.changeStatus !== 'pending' || !booking.proposedVehicleId) {
      return res.status(400).json({ success: false, message: 'No pending vehicle change request exists' });
    }

    // Apply change
    booking.vehicleId = booking.proposedVehicleId;
    booking.vehicle = booking.proposedVehicle;

    // Recalculate price
    booking.basePrice = booking.totalDays * booking.vehicle.pricePerDay;
    booking.totalPrice = booking.basePrice + booking.extraKmCost;

    // Clear proposal
    booking.proposedVehicleId = '';
    booking.proposedVehicle = undefined;
    booking.changeStatus = 'none';

    await booking.save();
    res.json({ success: true, message: 'Vehicle change request approved successfully', data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ==================== REJECT VEHICLE CHANGE (Admin) ====================
// PUT /api/bookings/:id/reject-change
router.put('/:id/reject-change', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Clear proposal
    booking.proposedVehicleId = '';
    booking.proposedVehicle = undefined;
    booking.changeStatus = 'none';

    await booking.save();
    res.json({ success: true, message: 'Vehicle change request rejected', data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

export default router;
