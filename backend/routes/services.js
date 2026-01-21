// backend/routes/services.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const ServiceRequest = require('../models/ServiceRequest');
const ServiceProvider = require('../models/ServiceProvider');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Create new service request (Customer only)
router.post('/request', auth, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ error: 'Only customers can create service requests' });
    }

    const { providerId, serviceType, description, scheduledDate, address, estimatedHours } = req.body;

    // Get provider details to calculate price
    const provider = await ServiceProvider.findOne({ userId: providerId }).populate('userId');
    if (!provider || !provider.isApproved) {
      return res.status(404).json({ error: 'Provider not found or not approved' });
    }

    // Calculate total price
    const totalPrice = estimatedHours * provider.hourlyRate;

    // Create service request
    const serviceRequest = new ServiceRequest({
      customerId: req.user._id,
      providerId: providerId,
      serviceProviderId: provider._id,
      serviceType,
      description,
      scheduledDate: new Date(scheduledDate),
      address,
      estimatedHours,
      totalPrice,
      status: 'pending'
    });

    await serviceRequest.save();

    // Create notification for provider
    await Notification.create({
      userId: providerId,
      title: 'New Service Request',
      message: `You have a new ${serviceType} request from ${req.user.name}`,
      type: 'request',
      relatedId: serviceRequest._id
    });

    res.status(201).json({
      success: true,
      message: 'Service request created successfully',
      request: serviceRequest
    });

  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get customer's service requests
router.get('/customer/requests', auth, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ error: 'Only customers can view these requests' });
    }

    const requests = await ServiceRequest.find({ customerId: req.user._id })
      .populate('providerId', 'name phone')
      .populate('serviceProviderId', 'profession hourlyRate')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    console.error('Get customer requests error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get provider's service requests
router.get('/provider/requests', auth, async (req, res) => {
  try {
    if (req.user.role !== 'provider') {
      return res.status(403).json({ error: 'Only providers can view these requests' });
    }

    const { status } = req.query;
    let filter = { providerId: req.user._id };

    if (status && status !== 'all') {
      filter.status = status;
    }

    const requests = await ServiceRequest.find(filter)
      .populate('customerId', 'name phone address')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    console.error('Get provider requests error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Accept/Reject service request (Provider only)
router.put('/requests/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'provider') {
      return res.status(403).json({ error: 'Only providers can update request status' });
    }

    const { status, providerNotes } = req.body;
    const requestId = req.params.id;

    // Check if request exists and belongs to this provider
    const serviceRequest = await ServiceRequest.findOne({
      _id: requestId,
      providerId: req.user._id
    });

    if (!serviceRequest) {
      return res.status(404).json({ error: 'Service request not found' });
    }

    // Update status
    serviceRequest.status = status;
    if (providerNotes) {
      serviceRequest.providerNotes = providerNotes;
    }
    serviceRequest.updatedAt = new Date();

    await serviceRequest.save();

    // Create notification for customer
    await Notification.create({
      userId: serviceRequest.customerId,
      title: `Request ${status}`,
      message: `Your ${serviceRequest.serviceType} request has been ${status}`,
      type: 'acceptance',
      relatedId: serviceRequest._id
    });

    // If accepted, update provider availability
    if (status === 'accepted') {
      await ServiceProvider.findOneAndUpdate(
        { userId: req.user._id },
        { availability: 'busy' }
      );
    }

    res.json({
      success: true,
      message: `Request ${status} successfully`,
      request: serviceRequest
    });

  } catch (error) {
    console.error('Update request status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark service as completed (Provider only)
router.put('/requests/:id/complete', auth, async (req, res) => {
  try {
    if (req.user.role !== 'provider') {
      return res.status(403).json({ error: 'Only providers can mark service as complete' });
    }

    const requestId = req.params.id;

    const serviceRequest = await ServiceRequest.findOne({
      _id: requestId,
      providerId: req.user._id,
      status: 'accepted'
    });

    if (!serviceRequest) {
      return res.status(404).json({ error: 'Service request not found or not accepted' });
    }

    // Update status to completed
    serviceRequest.status = 'completed';
    serviceRequest.updatedAt = new Date();
    await serviceRequest.save();

    // Update provider stats
    const provider = await ServiceProvider.findOne({ userId: req.user._id });
    if (provider) {
      provider.completedJobs += 1;
      provider.totalJobs += 1;
      await provider.save();
    }

    // Create notification for customer
    await Notification.create({
      userId: serviceRequest.customerId,
      title: 'Service Completed',
      message: `Your ${serviceRequest.serviceType} service has been marked as completed`,
      type: 'completion',
      relatedId: serviceRequest._id
    });

    // Update provider availability
    await ServiceProvider.findOneAndUpdate(
      { userId: req.user._id },
      { availability: 'available' }
    );

    res.json({
      success: true,
      message: 'Service marked as completed successfully',
      request: serviceRequest
    });

  } catch (error) {
    console.error('Complete service error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Rate and review completed service (Customer only)
router.post('/requests/:id/rate', auth, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ error: 'Only customers can rate services' });
    }

    const { rating, review } = req.body;
    const requestId = req.params.id;

    // Check if request exists, is completed, and belongs to this customer
    const serviceRequest = await ServiceRequest.findOne({
      _id: requestId,
      customerId: req.user._id,
      status: 'completed'
    });

    if (!serviceRequest) {
      return res.status(404).json({ error: 'Service request not found or not completed' });
    }

    // Update rating and review
    serviceRequest.customerRating = rating;
    serviceRequest.customerReview = review;
    await serviceRequest.save();

    // Update provider's average rating
    const providerRequests = await ServiceRequest.find({
      providerId: serviceRequest.providerId,
      status: 'completed',
      customerRating: { $exists: true }
    });

    const totalRating = providerRequests.reduce((sum, req) => sum + req.customerRating, 0);
    const averageRating = totalRating / providerRequests.length;

    await ServiceProvider.findOneAndUpdate(
      { userId: serviceRequest.providerId },
      { 
        rating: averageRating,
        $inc: { totalJobs: 1 }
      }
    );

    // Create notification for provider
    await Notification.create({
      userId: serviceRequest.providerId,
      title: 'New Rating Received',
      message: `You received a ${rating} star rating for your service`,
      type: 'rating',
      relatedId: serviceRequest._id
    });

    res.json({
      success: true,
      message: 'Rating submitted successfully',
      request: serviceRequest
    });

  } catch (error) {
    console.error('Rate service error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get service request by ID
router.get('/requests/:id', auth, async (req, res) => {
  try {
    const requestId = req.params.id;

    const serviceRequest = await ServiceRequest.findById(requestId)
      .populate('customerId', 'name phone')
      .populate('providerId', 'name phone');

    if (!serviceRequest) {
      return res.status(404).json({ error: 'Service request not found' });
    }

    // Check if user has permission to view this request
    if (
      req.user.role !== 'admin' &&
      req.user._id.toString() !== serviceRequest.customerId._id.toString() &&
      req.user._id.toString() !== serviceRequest.providerId._id.toString()
    ) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      success: true,
      request: serviceRequest
    });

  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;