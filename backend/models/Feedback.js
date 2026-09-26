import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5
    },
    message: {
      type: String,
      required: [true, 'Feedback message is required'],
      trim: true,
      maxlength: 1000
    },
    userId: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['approved', 'pending'],
      default: 'approved'
    }
  },
  { timestamps: true }
);

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;