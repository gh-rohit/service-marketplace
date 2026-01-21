const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const providerRoutes = require('./routes/providers');
const serviceRoutes = require('./routes/services');
const notificationRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');

const app = express();

/* =======================
   ✅ CORS CONFIG (UPDATED)
   ======================= */
app.use(
  cors({
    origin: [ // local frontend
      "https://service-marketplace-frontend.onrender.com" // 🔥 LIVE FRONTEND
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
);

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('Local Services API is running...');
});

// Database connection
mongoose
  .connect(
    process.env.MONGODB_URI ||
      'mongodb+srv://rohitraj_dbUser:rohitraj@cluster0.nnkqk7h.mongodb.net/ServiceHub?appName=Cluster0'
  )
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.log('MongoDB connection error:', err));

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
