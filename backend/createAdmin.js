// backend/createAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://rohitraj_dbUser:rohitraj@cluster0.nnkqk7h.mongodb.net/ServiceHub?appName=Cluster0', {
    });

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@service.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = new User({
      name: 'System Admin',
      email: 'admin@service.com',
      password: hashedPassword,
      phone: '9999999999',
      role: 'admin',
      address: {
        street: 'Admin Street',
        city: 'Admin City',
        state: 'Admin State',
        pincode: '000000'
      }
    });

    await admin.save();
    console.log('Admin user created successfully!');
    console.log('Email: admin@service.com');
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();