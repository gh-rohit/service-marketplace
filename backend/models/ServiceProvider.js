// backend/models/ServiceProvider.js
const mongoose = require('mongoose');

const serviceProviderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  profession: {
    type: String,
    required: true,
    enum: ['plumber', 'electrician', 'carpenter', 'painter', 'mechanic', 'cleaner', 'other']
  },
  skills: [String],
  experience: {
    type: Number,
    required: true
  },
  hourlyRate: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0
  },
  totalJobs: {
    type: Number,
    default: 0
  },
  completedJobs: {
    type: Number,
    default: 0
  },
  documents: [{
    type: String
  }],
  serviceAreas: [String],
  availability: {
    type: String,
    enum: ['available', 'busy', 'unavailable'],
    default: 'available'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ServiceProvider = mongoose.model('ServiceProvider', serviceProviderSchema);
module.exports = ServiceProvider;