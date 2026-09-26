import mongoose from 'mongoose';

// Each message inside a conversation thread
const threadItemSchema = new mongoose.Schema({
  sender: { type: String, required: true },  // 'customer' or 'admin'
  text: { type: String, required: true },
  read: { type: Boolean, default: false },   // has the other side read it?
  createdAt: { type: Date, default: Date.now }
});

const messageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    subject: { type: String },
    thread: [threadItemSchema],  // full conversation
  },
  { timestamps: true }
);

export default mongoose.model('Message', messageSchema);