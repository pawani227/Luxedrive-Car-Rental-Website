import express from 'express';
import Feedback from '../models/Feedback.js';

const router = express.Router();

// ==================== CREATE FEEDBACK ====================
// POST /api/feedback
router.post('/', async (req, res) => {
  try {
    const { name, email, rating, message, userId } = req.body;

    // Validation
    if (!name || !email || !rating || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rating must be between 1 and 5' 
      });
    }

    const newFeedback = await Feedback.create({
      name,
      email,
      rating,
      message,
      userId: userId || ''
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback!',
      data: newFeedback
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: err.message 
    });
  }
});

// ==================== GET ALL FEEDBACK ====================
// GET /api/feedback
router.get('/', async (req, res) => {
  try {
    const { limit } = req.query;
    
    let query = Feedback.find({ status: 'approved' }).sort({ createdAt: -1 });
    
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    const feedbacks = await query;
    
    // Average rating calculation
    const allFeedbacks = await Feedback.find({ status: 'approved' });
    const averageRating = allFeedbacks.length > 0
      ? (allFeedbacks.reduce((sum, f) => sum + f.rating, 0) / allFeedbacks.length).toFixed(1)
      : 0;
    
    res.json({
      success: true,
      count: feedbacks.length,
      averageRating: parseFloat(averageRating),
      totalReviews: allFeedbacks.length,
      data: feedbacks
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: err.message 
    });
  }
});

// ==================== DELETE FEEDBACK (Admin) ====================
// DELETE /api/feedback/:id
router.delete('/:id', async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) {
      return res.status(404).json({ 
        success: false, 
        message: 'Feedback not found' 
      });
    }
    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: err.message 
    });
  }
});

export default router;