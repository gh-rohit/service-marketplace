// backend/routes/providers.js
const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const User = require('../models/User');
const ServiceProvider = require('../models/ServiceProvider');
const ServiceRequest = require('../models/ServiceRequest');

// Get all approved providers (Public route)
router.get('/approved', async (req, res) => {
  try {
    const { profession, city, minRating } = req.query;
    
    let filter = { isApproved: true };
    
    if (profession) {
      filter.profession = profession;
    }
    
    if (minRating) {
      filter.rating = { $gte: parseFloat(minRating) };
    }

    const providers = await ServiceProvider.find(filter)
      .populate('userId', 'name email phone address profileImage')
      .sort({ rating: -1, createdAt: -1 });

    // Filter by city if provided
    let filteredProviders = providers;
    if (city) {
      filteredProviders = providers.filter(provider => 
        provider.userId.address?.city?.toLowerCase().includes(city.toLowerCase()) ||
        provider.serviceAreas?.some(area => area.toLowerCase().includes(city.toLowerCase()))
      );
    }

    res.json({
      success: true,
      count: filteredProviders.length,
      providers: filteredProviders
    });
  } catch (error) {
    console.error('Get providers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get provider by ID (Public)
router.get('/:id', async (req, res) => {
  try {
    const provider = await ServiceProvider.findById(req.params.id)
      .populate('userId', 'name email phone address profileImage');

    if (!provider || !provider.isApproved) {
      return res.status(404).json({ error: 'Provider not found or not approved' });
    }

    // Get provider's reviews
    const reviews = await ServiceRequest.find({
      providerId: provider.userId._id,
      status: 'completed',
      customerRating: { $exists: true }
    })
    .populate('customerId', 'name')
    .select('customerRating customerReview createdAt')
    .sort({ createdAt: -1 })
    .limit(10);

    res.json({
      success: true,
      provider,
      reviews
    });
  } catch (error) {
    console.error('Get provider error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get pending providers (Admin only)
router.get('/admin/pending', auth, isAdmin, async (req, res) => {
  try {
    const providers = await ServiceProvider.find({ isApproved: false })
      .populate('userId', 'name email phone address')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      count: providers.length,
      providers
    });
  } catch (error) {
    console.error('Get pending providers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Approve/Reject provider (Admin only)
router.put('/admin/:id/approve', auth, isAdmin, async (req, res) => {
  try {
    const { isApproved, reason } = req.body;
    
    const provider = await ServiceProvider.findByIdAndUpdate(
      req.params.id,
      { 
        isApproved,
        $push: {
          adminNotes: {
            note: reason || (isApproved ? 'Provider approved' : 'Provider rejected'),
            date: new Date()
          }
        }
      },
      { new: true }
    ).populate('userId', 'name email');

    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    // Create notification for provider
    const Notification = require('../models/Notification');
    await Notification.create({
      userId: provider.userId._id,
      title: isApproved ? 'Account Approved' : 'Account Rejected',
      message: isApproved 
        ? 'Your provider account has been approved. You can now receive service requests.'
        : `Your provider account has been rejected. Reason: ${reason || 'Not specified'}`,
      type: 'system'
    });

    res.json({
      success: true,
      message: `Provider ${isApproved ? 'approved' : 'rejected'} successfully`,
      provider
    });
  } catch (error) {
    console.error('Approve provider error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get provider dashboard stats
router.get('/dashboard/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'provider') {
      return res.status(403).json({ error: 'Only providers can access this' });
    }

    const provider = await ServiceProvider.findOne({ userId: req.user._id });
    if (!provider) {
      return res.status(404).json({ error: 'Provider profile not found' });
    }

    // Get statistics
    const totalRequests = await ServiceRequest.countDocuments({
      providerId: req.user._id
    });

    const pendingRequests = await ServiceRequest.countDocuments({
      providerId: req.user._id,
      status: 'pending'
    });

    const acceptedRequests = await ServiceRequest.countDocuments({
      providerId: req.user._id,
      status: 'accepted'
    });

    const completedRequests = await ServiceRequest.countDocuments({
      providerId: req.user._id,
      status: 'completed'
    });

    const totalEarnings = await ServiceRequest.aggregate([
      {
        $match: {
          providerId: req.user._id,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        totalRequests,
        pendingRequests,
        acceptedRequests,
        completedRequests,
        totalEarnings: totalEarnings[0]?.total || 0,
        rating: provider.rating,
        completedJobs: provider.completedJobs
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;