import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: { 
      type: String, 
      required: [true, 'Email is required'], 
      unique: true, 
      trim: true, 
      lowercase: true 
    },
    password: { type: String, required: [true, 'Password is required'] },
    role: { 
      type: String, 
      required: true, 
      enum: ['customer', 'provider', 'admin'], 
      default: 'customer' 
    },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    companyName: { type: String, default: '' },
    licenseNo: { type: String, default: '' },
    isBlocked: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;
