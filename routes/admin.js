const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const Mechanic = require('../models/Mechanic');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes require admin role
router.use(protect, authorize('admin'));

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private (Admin only)
router.get('/dashboard', async (req, res) => {
  try {
    // Get total counts
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalVendors = await User.countDocuments({ role: 'vendor' });
    const totalMechanics = await User.countDocuments({ role: 'mechanic' });
    const totalVehicles = await Vehicle.countDocuments();
    const totalBookings = await Booking.countDocuments();

    // Get pending vendor approvals
    const pendingVendors = await User.countDocuments({ 
      role: 'vendor', 
      isApproved: false 
    });

    // Get revenue data
    const revenueData = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalRevenue: { $sum: '$totalAmount' },
          bookingCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    // Get recent bookings
    const recentBookings = await Booking.find()
      .populate('userId', 'name email')
      .populate('vehicleId', 'name')
      .populate('vendorId', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get vehicle statistics
    const vehicleStats = await Vehicle.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgPrice: { $avg: '$pricePerDay' }
        }
      }
    ]);

    // Get booking status distribution
    const bookingStats = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      counts: {
        totalUsers,
        totalVendors,
        totalMechanics,
        totalVehicles,
        totalBookings,
        pendingVendors
      },
      revenueData,
      recentBookings,
      vehicleStats,
      bookingStats
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/vendors/pending
// @desc    Get pending vendor approvals
// @access  Private (Admin only)
router.get('/vendors/pending', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const pendingVendors = await User.find({ 
      role: 'vendor', 
      isApproved: false 
    })
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await User.countDocuments({ 
      role: 'vendor', 
      isApproved: false 
    });

    res.json({
      vendors: pendingVendors,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalVendors: total
      }
    });
  } catch (error) {
    console.error('Get pending vendors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/vendors/:id/approve
// @desc    Approve vendor
// @access  Private (Admin only)
router.put('/vendors/:id/approve', async (req, res) => {
  try {
    const vendor = await User.findById(req.params.id);
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    if (vendor.role !== 'vendor') {
      return res.status(400).json({ message: 'User is not a vendor' });
    }

    if (vendor.isApproved) {
      return res.status(400).json({ message: 'Vendor is already approved' });
    }

    vendor.isApproved = true;
    await vendor.save();

    res.json({ 
      message: 'Vendor approved successfully',
      vendor: {
        _id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone,
        role: vendor.role,
        isApproved: vendor.isApproved
      }
    });
  } catch (error) {
    console.error('Approve vendor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/vendors/:id/reject
// @desc    Reject vendor
// @access  Private (Admin only)
router.put('/vendors/:id/reject', [
  body('reason').trim().isLength({ min: 5 }).withMessage('Rejection reason is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const vendor = await User.findById(req.params.id);
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    if (vendor.role !== 'vendor') {
      return res.status(400).json({ message: 'User is not a vendor' });
    }

    // Deactivate the vendor account
    vendor.isActive = false;
    await vendor.save();

    res.json({ 
      message: 'Vendor rejected successfully',
      reason: req.body.reason
    });
  } catch (error) {
    console.error('Reject vendor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination
// @access  Private (Admin only)
router.get('/users', async (req, res) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (role) {
      filter.role = role;
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalUsers: total
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/vehicles
// @desc    Get all vehicles with pagination
// @access  Private (Admin only)
router.get('/vehicles', async (req, res) => {
  try {
    const { type, available, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (type) filter.type = type;
    if (available !== undefined) filter.isAvailable = available === 'true';

    const vehicles = await Vehicle.find(filter)
      .populate('vendorId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Vehicle.countDocuments(filter);

    res.json({
      vehicles,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalVehicles: total
      }
    });
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/bookings
// @desc    Get all bookings with pagination
// @access  Private (Admin only)
router.get('/bookings', async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate('userId', 'name email')
      .populate('vehicleId', 'name')
      .populate('vendorId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(filter);

    res.json({
      bookings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalBookings: total
      }
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/analytics
// @desc    Get detailed analytics
// @access  Private (Admin only)
router.get('/analytics', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Revenue analytics
    const revenueAnalytics = await Booking.aggregate([
      { $match: { ...dateFilter, paymentStatus: 'paid' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } }
    ]);

    // User registration analytics
    const userAnalytics = await User.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          users: { $sum: 1 },
          vendors: { $sum: { $cond: [{ $eq: ['$role', 'vendor'] }, 1, 0] } },
          mechanics: { $sum: { $cond: [{ $eq: ['$role', 'mechanic'] }, 1, 0] } }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    ]);

    // Vehicle type distribution
    const vehicleTypeDistribution = await Vehicle.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgPrice: { $avg: '$pricePerDay' }
        }
      }
    ]);

    // Booking status distribution
    const bookingStatusDistribution = await Booking.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    res.json({
      revenueAnalytics,
      userAnalytics,
      vehicleTypeDistribution,
      bookingStatusDistribution
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
