import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'luxedrive_secret_2024';

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ==================== REGISTER USER ====================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, address, companyName, licenseNo } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    // Check if email already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role || 'customer',
      phone: phone || '',
      address: address || '',
      companyName: companyName || '',
      licenseNo: licenseNo || '',
      isBlocked: false
    });

    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        address: newUser.address,
        companyName: newUser.companyName,
        licenseNo: newUser.licenseNo,
        token
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ==================== LOGIN USER ====================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Support both hashed and legacy plain-text passwords for migration
    let isPasswordValid = false;
    if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
      // Hashed password
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      // Legacy plain-text (migrate on login)
      if (user.password === password) {
        isPasswordValid = true;
        // Migrate to hashed
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
      }
    }

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Your account has been blocked. Please contact support.' });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        companyName: user.companyName,
        licenseNo: user.licenseNo,
        token
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ==================== GET ALL USERS (Admin) ====================
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ==================== TOGGLE BLOCK STATUS (Admin) ====================
router.put('/:id/block', async (req, res) => {
  try {
    const { isBlocked } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isBlocked }, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ==================== DELETE USER (Admin) ====================
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

export default router;
