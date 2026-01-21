// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const User = require('../models/User');
const ServiceProvider = require('../models/ServiceProvider');
const ServiceRequest = require('../models/ServiceRequest');
const Notification = require('../models/Notification'); // Add this import

// Get admin dashboard statistics
router.get('/dashboard/stats', auth, isAdmin, async (req, res) => {
  try {
    // Get counts
    const totalUsers = await User.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalProviders = await User.countDocuments({ role: 'provider' });
    const approvedProviders = await ServiceProvider.countDocuments({ isApproved: true });
    const pendingProviders = await ServiceProvider.countDocuments({ isApproved: false });

    // Get service requests statistics
    const totalRequests = await ServiceRequest.countDocuments();
    const pendingRequests = await ServiceRequest.countDocuments({ status: 'pending' });
    const completedRequests = await ServiceRequest.countDocuments({ status: 'completed' });

    // Get recent requests
    const recentRequests = await ServiceRequest.find()
      .populate('customerId', 'name email phone')
      .populate('providerId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get recent registrations
    const recentRegistrations = await User.find()
      .select('name email role createdAt isActive')
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate total revenue
    const revenueData = await ServiceRequest.aggregate([
      {
        $match: { status: 'completed' }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalCustomers,
        totalProviders,
        approvedProviders,
        pendingProviders,
        totalRequests,
        pendingRequests,
        completedRequests,
        totalRevenue: revenueData[0]?.totalRevenue || 0,
        recentRequests,
        recentRegistrations
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get pending providers
router.get('/providers/pending', auth, isAdmin, async (req, res) => {
  try {
    const providers = await ServiceProvider.find({ isApproved: false })
      .populate('userId', 'name email phone address city')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      providers: providers.map(provider => ({
        _id: provider._id,
        userId: provider.userId,
        profession: provider.profession,
        experience: provider.experience,
        hourlyRate: provider.hourlyRate,
        description: provider.description,
        isApproved: provider.isApproved,
        createdAt: provider.createdAt,
        skills: provider.skills || [],
        completedJobs: provider.completedJobs || 0,
        rating: provider.rating || 0,
        responseTime: provider.responseTime || 'Within 1 hour'
      }))
    });
  } catch (error) {
    console.error('Get pending providers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Approve/reject provider WITH NOTIFICATION
router.put('/providers/:id/approve', auth, isAdmin, async (req, res) => {
  try {
    const { isApproved, reason } = req.body;

    const provider = await ServiceProvider.findByIdAndUpdate(
      req.params.id,
      { 
        isApproved,
        approvedAt: isApproved ? new Date() : null,
        approvalNotes: reason
      },
      { new: true }
    ).populate('userId', 'name email');

    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    // Update user status
    if (provider.userId) {
      await User.findByIdAndUpdate(
        provider.userId._id,
        { 
          isActive: isApproved,
          status: isApproved ? 'active' : 'rejected'
        }
      );

      // ✅ CREATE NOTIFICATION FOR PROVIDER
      const notification = new Notification({
        userId: provider.userId._id,
        title: isApproved 
          ? '🎉 Provider Account Approved!' 
          : '❌ Provider Application Rejected',
        message: isApproved
          ? `Congratulations! Your provider account for "${provider.profession}" has been approved. ${reason ? `Note: ${reason}` : 'You can now start accepting service requests.'}`
          : `Your provider application for "${provider.profession}" has been reviewed. ${reason ? `Reason: ${reason}` : 'Please contact support for more details.'}`,
        type: 'system',
        relatedId: provider._id
      });

      await notification.save();

      // ✅ SEND EMAIL NOTIFICATION (Optional)
      try {
        await sendProviderApprovalEmail(
          provider.userId.email,
          provider.userId.name,
          provider.profession,
          isApproved,
          reason
        );
      } catch (emailError) {
        console.log('Email sending failed:', emailError);
        // Don't fail the request if email fails
      }
    }

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

// Email sending function for provider approval
const sendProviderApprovalEmail = async (email, name, profession, isApproved, reason) => {
  // This is a mock function. Implement with nodemailer, sendgrid, etc.
  console.log(`📧 Sending ${isApproved ? 'approval' : 'rejection'} email to: ${email}`);
  console.log(`👤 Name: ${name}`);
  console.log(`🔧 Profession: ${profession}`);
  console.log(`📝 Reason: ${reason || 'No reason provided'}`);
  
  // Example implementation with nodemailer:
  /*
  const nodemailer = require('nodemailer');
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: isApproved 
      ? `🎉 Your ${profession} Provider Account is Approved!`
      : `Update on Your ${profession} Provider Application`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">
            ${isApproved ? '🎉 Congratulations!' : 'Application Update'}
          </h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
            Hello <strong>${name}</strong>,
          </p>
          
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
            ${isApproved
              ? `Your <strong>${profession}</strong> provider account has been successfully approved by our admin team.`
              : `Your <strong>${profession}</strong> provider application has been reviewed by our admin team.`
            }
          </p>
          
          ${reason ? `
            <div style="background: ${isApproved ? '#e8f5e9' : '#ffebee'}; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: ${isApproved ? '#2e7d32' : '#c62828'};">
                <strong>Note:</strong> ${reason}
              </p>
            </div>
          ` : ''}
          
          ${isApproved ? `
            <div style="background: #e3f2fd; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1976d2;">What's Next?</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Start accepting service requests</li>
                <li>Set your availability and working hours</li>
                <li>Update your profile to attract more customers</li>
                <li>Check and respond to incoming requests</li>
              </ul>
            </div>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/provider/dashboard" 
               style="display: inline-block; padding: 12px 30px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0;">
              Go to Provider Dashboard →
            </a>
          ` : `
            <div style="background: #fff3e0; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #f57c00;">What to do next?</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Review your application details</li>
                <li>Update any missing information</li>
                <li>Contact support if you have questions</li>
                <li>Resubmit your application</li>
              </ul>
            </div>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/provider/profile" 
               style="display: inline-block; padding: 12px 30px; background: #2196F3; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0;">
              Update Your Profile →
            </a>
          `}
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
          
          <p style="font-size: 14px; color: #666; margin: 0;">
            Need help? Contact our support team at support@servicehub.com
          </p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
  */
};

// Get all service requests (Admin)
router.get('/requests', auth, isAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const requests = await ServiceRequest.find(filter)
      .populate('customerId', 'name email phone')
      .populate('providerId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ServiceRequest.countDocuments(filter);

    res.json({
      success: true,
      requests,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get all requests error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user status WITH NOTIFICATION
router.put('/users/:id/status', auth, isAdmin, async (req, res) => {
  try {
    const { isActive, reason } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // ✅ CREATE NOTIFICATION FOR USER STATUS CHANGE
    const notification = new Notification({
      userId: user._id,
      title: isActive 
        ? '✅ Account Activated' 
        : '⛔ Account Deactivated',
      message: isActive
        ? `Your account has been activated by admin. ${reason ? `Note: ${reason}` : ''}`
        : `Your account has been deactivated by admin. ${reason ? `Reason: ${reason}` : 'Please contact support for more details.'}`,
      type: 'system',
      relatedId: user._id
    });

    await notification.save();

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user WITH NOTIFICATION
router.delete('/users/:id', auth, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting admin users
    if (user.role === 'admin') {
      return res.status(400).json({ error: 'Cannot delete admin user' });
    }

    // Send notification before deletion
    const notification = new Notification({
      userId: user._id,
      title: '🗑️ Account Deleted',
      message: 'Your account has been deleted by admin. All your data has been removed from the system.',
      type: 'system'
    });

    await notification.save();

    // Delete associated data
    if (user.role === 'provider') {
      await ServiceProvider.deleteOne({ userId: user._id });
      await ServiceRequest.deleteMany({ providerId: user._id });
    } else if (user.role === 'customer') {
      await ServiceRequest.deleteMany({ customerId: user._id });
    }

    // Delete user
    await User.deleteOne({ _id: user._id });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all users (Admin)
router.get('/users', auth, isAdmin, async (req, res) => {
  try {
    const { role, status, page = 1, limit = 20, search } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};

    // Role filter
    if (role && role !== 'all') {
      filter.role = role;
    }

    // Status filter
    if (status && status !== 'all') {
      filter.isActive = status === 'active';
    }

    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Get users with pagination
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get provider details for provider users
    const usersWithDetails = await Promise.all(
      users.map(async (user) => {
        const userObj = user.toObject();
        
        if (user.role === 'provider') {
          const provider = await ServiceProvider.findOne({ userId: user._id })
            .select('profession experience hourlyRate isApproved completedJobs rating');
          if (provider) {
            userObj.providerInfo = provider;
          }
        }

        // Get booking counts
        if (user.role === 'customer') {
          const bookings = await ServiceRequest.countDocuments({ customerId: user._id });
          userObj.bookings = bookings;
        } else if (user.role === 'provider') {
          const bookings = await ServiceRequest.countDocuments({ providerId: user._id });
          const completedBookings = await ServiceRequest.countDocuments({ 
            providerId: user._id, 
            status: 'completed' 
          });
          userObj.bookings = bookings;
          userObj.completedBookings = completedBookings;
        }

        return userObj;
      })
    );

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      users: usersWithDetails,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user by ID (Admin)
router.get('/users/:id', auth, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = user.toObject();

    // Add provider details if user is a provider
    if (user.role === 'provider') {
      const provider = await ServiceProvider.findOne({ userId: user._id });
      if (provider) {
        userData.providerDetails = provider;
      }
    }

    // Get user statistics
    if (user.role === 'customer') {
      const bookings = await ServiceRequest.countDocuments({ customerId: user._id });
      const completedBookings = await ServiceRequest.countDocuments({ 
        customerId: user._id, 
        status: 'completed' 
      });
      const pendingBookings = await ServiceRequest.countDocuments({ 
        customerId: user._id, 
        status: 'pending' 
      });

      userData.stats = {
        totalBookings: bookings,
        completedBookings,
        pendingBookings
      };
    } else if (user.role === 'provider') {
      const bookings = await ServiceRequest.countDocuments({ providerId: user._id });
      const completedBookings = await ServiceRequest.countDocuments({ 
        providerId: user._id, 
        status: 'completed' 
      });
      const pendingBookings = await ServiceRequest.countDocuments({ 
        providerId: user._id, 
        status: 'pending' 
      });
      const earnings = await ServiceRequest.aggregate([
        {
          $match: { 
            providerId: user._id, 
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

      userData.stats = {
        totalBookings: bookings,
        completedBookings,
        pendingBookings,
        totalEarnings: earnings[0]?.total || 0
      };
    }

    res.json({
      success: true,
      user: userData
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;