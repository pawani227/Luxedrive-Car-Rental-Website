import express from 'express';
import DelayReport from '../models/DelayReport.js';

const router = express.Router();

// CREATE Delay Report
router.post('/', async (req, res) => {
  try {
    const { bookingId, customerName, customerEmail, reason, vehicleDetails } = req.body;
    if (!bookingId || !customerName || !reason) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const report = await DelayReport.create({
      bookingId,
      customerName,
      customerEmail,
      reason,
      vehicleDetails,
      thread: [{ sender: 'customer', text: reason }]
    });
    res.status(201).json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ All Delay Reports (Admin)
router.get('/', async (req, res) => {
  try {
    const reports = await DelayReport.find().populate('bookingId').sort({ createdAt: -1 });
    res.json({ success: true, data: reports });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ Delay Reports for User
router.get('/user/:email', async (req, res) => {
  try {
    const reports = await DelayReport.find({ customerEmail: req.params.email }).populate('bookingId').sort({ createdAt: -1 });
    res.json({ success: true, data: reports });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD Reply (Admin or Customer)
router.put('/:id/reply', async (req, res) => {
  try {
    const { sender, text } = req.body;
    if (!sender || !text) {
      return res.status(400).json({ error: 'Sender and text are required' });
    }
    const report = await DelayReport.findById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Not found' });
    
    report.thread.push({ sender, text });
    if (sender === 'admin') {
      // Keep it pending or whatever the logic is. We don't auto-resolve here anymore to allow continuous chat
    }
    await report.save();
    
    res.json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE Delay Report Status (Admin)
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const report = await DelayReport.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!report) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
