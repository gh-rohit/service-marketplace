// backend/models/ServiceRequest.js
const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceProviderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider'
  },
  serviceType: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  estimatedHours: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  customerRating: {
    type: Number,
    min: 1,
    max: 5
  },
  customerReview: {
    type: String
  },
  providerNotes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);
module.exports = ServiceRequest;