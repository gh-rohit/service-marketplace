// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ServiceProvider = require('../models/ServiceProvider');
const { auth } = require('../middleware/auth');

// Register User
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role, address } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role: role || 'customer',
      address
    });

    await user.save();

    // If role is provider, create service provider entry
    if (role === 'provider') {
      const serviceProvider = new ServiceProvider({
        userId: user._id,
        profession: req.body.profession || 'other',
        experience: req.body.experience || 0,
        hourlyRate: req.body.hourlyRate || 0,
        description: req.body.description || '',
        skills: req.body.skills || [],
        serviceAreas: req.body.serviceAreas || []
      });
      await serviceProvider.save();
    }

    // Create token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Current User Profile
router.get('/me', auth, async (req, res) => {
    try {
      const user = await User.findById(req.user._id).select('-password');
      
      // If user is provider, get provider details
      let providerDetails = null;
      if (user.role === 'provider') {
        providerDetails = await ServiceProvider.findOne({ userId: user._id });
      }
  
      res.json({
        success: true,
        user,
        providerDetails
      });
  
    } catch (error) {
      console.error('Profile error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

module.exports = router;