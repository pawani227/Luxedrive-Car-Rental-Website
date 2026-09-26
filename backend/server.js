import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Message from './models/Message.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import userRoutes from './routes/userRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import delayRoutes from './routes/delayRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

import Vehicle from './models/Vehicle.js';

dotenv.config();

const app = express();

// Middleware - only once, with 50MB limit
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected successfully');
    try {
      // Auto-unlock any vehicles that were set to unavailable due to previous booking code
      await Vehicle.updateMany({}, { available: true });
    } catch (err) {
      console.error('Error resetting vehicle availability:', err);
    }
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err.message));

app.get('/', (req, res) => res.send('🚀 LuxeDrive API is running...'));

// ==================== MESSAGE ROUTES ====================

// CREATE - customer submits first message (from contact form)
app.post('/api/messages', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Name, email, subject, and message are required' });
    }
    const newMessage = await Message.create({
      name, email, phone, subject,
      thread: [{ sender: 'customer', text: message, read: false }]
    });
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ - admin gets all conversations (newest activity first)
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ updatedAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ - customer gets their conversations by email
app.get('/api/messages/user/:email', async (req, res) => {
  try {
    const messages = await Message.find({ email: req.params.email }).sort({ updatedAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD a new message to the conversation (customer OR admin)
app.post('/api/messages/:id/reply', async (req, res) => {
  try {
    const { sender, text } = req.body;
    if (!sender || !text) return res.status(400).json({ error: 'sender and text are required' });
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ error: 'Not found' });
    msg.thread.push({ sender, text, read: false });
    await msg.save();
    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// MARK messages as read (reader = 'customer' or 'admin')
app.put('/api/messages/:id/read', async (req, res) => {
  try {
    const { reader } = req.body;
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ error: 'Not found' });
    msg.thread.forEach(m => {
      if (m.sender !== reader) m.read = true;
    });
    await msg.save();
    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE conversation
app.delete('/api/messages/:id', async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== FEATURE ROUTES ====================
app.use('/api/feedback', feedbackRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/delays', delayRoutes);
app.use('/api/notifications', notificationRoutes);

// ==================== 404 HANDLER ====================
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));