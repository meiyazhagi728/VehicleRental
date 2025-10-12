const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const Mechanic = require('../models/Mechanic');
const Settings = require('../models/Settings');
const { protect, authorize } = require('../middleware/auth');
const { waitForDatabase } = require('../middleware/dbConnection');

const router = express.Router();

// Health check endpoint (no auth required)
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Admin API is healthy',
    timestamp: new Date().toISOString()
  });
});

// All admin routes require admin role
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/dashboard', waitForDatabase, async (req, res) => {
  try {
    const [
      totalUsers,
      totalVendors,
      totalMechanics,
      totalVehicles,
      totalBookings,
      pendingBookings,
      activeBookings,
      completedBookings,
      recentUsers,
      recentBookings
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'vendor' }),
      Mechanic.countDocuments(),
      Vehicle.countDocuments(),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'active' }),
      Booking.countDocuments({ status: 'completed' }),
      User.find({ role: 'user' }).sort({ createdAt: -1 }).limit(5).select('name email createdAt'),
      Booking.find().sort({ createdAt: -1 }).limit(5)
        .populate('userId', 'name email')
        .populate('vehicleId', 'brand model')
    ]);

    const revenue = await Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.json({
      stats: {
        totalUsers,
        totalVendors,
        totalMechanics,
        totalVehicles,
        totalBookings,
        pendingBookings,
        activeBookings,
        completedBookings,
        totalRevenue: revenue[0]?.total || 0
      },
      recentUsers,
      recentBookings
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with filtering and pagination
// @access  Private (Admin only)
router.get('/users', waitForDatabase, async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (role) filter.role = role;
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;
    if (status === 'approved') filter.isApproved = true;
    if (status === 'pending') filter.isApproved = false;

    // Name/Email/Phone search
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: regex },
        { email: regex },
        // Phone is stored as Number; cast to string for regex using $expr
      ];
    }

    // If searching by phone, use aggregation to allow regex on stringified phone
    let usersQuery;
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      usersQuery = User.aggregate([
        { $match: filter.$or ? { ...filter, $or: undefined } : filter },
        {
          $addFields: {
            phoneStr: { $toString: '$phone' }
          }
        },
        {
          $match: {
            $or: [
              ...(filter.$or || []),
              { phoneStr: { $regex: regex } }
            ]
          }
        },
        { $project: { password: 0 } },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: parseInt(limit) }
      ]);
    } else {
      usersQuery = User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    }

    const [users, total] = await Promise.all([
      usersQuery,
      User.countDocuments(filter)
    ]);

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalUsers: total
      }
    });
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/users
// @desc    Create a new user (admin only)
// @access  Private (Admin only)
router.post('/users', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').matches(/^[0-9]{10}$/).withMessage('Valid 10-digit phone is required'),
  body('role').isIn(['user', 'vendor', 'mechanic', 'admin']).withMessage('Invalid role')
], async (req, res) => {
  try {
    console.log('Create user request body:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    // prevent duplicate email
    const existing = await User.findOne({ email: req.body.email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({
      name: req.body.name,
      email: req.body.email.toLowerCase(),
      password: req.body.password,
      phone: req.body.phone,
      role: req.body.role,
      isActive: req.body.isActive !== undefined ? !!req.body.isActive : true,
    });

    res.status(201).json(user);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update a user (admin only)
// @access  Private (Admin only)
router.put('/users/:id', [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional().matches(/^[0-9]{10}$/).withMessage('Valid 10-digit phone is required'),
  body('role').optional().isIn(['user', 'vendor', 'mechanic', 'admin']).withMessage('Invalid role')
], async (req, res) => {
  try {
    console.log('Update user request body:', req.body);
    console.log('Update user params:', req.params);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update allowed fields
    if (req.body.name !== undefined) user.name = req.body.name;
    if (req.body.email !== undefined) user.email = req.body.email.toLowerCase();
    if (req.body.phone !== undefined) user.phone = req.body.phone;
    if (req.body.role !== undefined) user.role = req.body.role;
    if (req.body.isActive !== undefined) user.isActive = !!req.body.isActive;
    if (req.body.password) user.password = req.body.password; // pre-save hook will hash

    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Toggle/Set user active status (admin only)
// @access  Private (Admin only)
router.put('/users/:id/status', [
  body('isActive').isBoolean().withMessage('isActive must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !!req.body.isActive;
    await user.save();

    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`, user });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/vehicles
// @desc    Get all vehicles with filtering and pagination
// @access  Private (Admin only)
router.get('/vehicles', waitForDatabase, async (req, res) => {
  try {
    const { status, vendor, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;
    if (status === 'available') filter.availability = true;
    if (status === 'unavailable') filter.availability = false;
    if (vendor) filter.vendorId = vendor;

    const vehicles = await Vehicle.find(filter)
      .populate('vendorId', 'name email phone')
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
    console.error('Get admin vehicles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/bookings
// @desc    Get all bookings with filtering and pagination
// @access  Private (Admin only)
router.get('/bookings', waitForDatabase, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate('userId', 'name email phone')
      .populate('vehicleId', 'brand model type')
      .populate('vehicleId.vendorId', 'name email')
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
    console.error('Get admin bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id/approve
// @desc    Approve vendor
// @access  Private (Admin only)
router.put('/users/:id/approve', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'vendor') {
      return res.status(400).json({ message: 'Only vendors can be approved' });
    }

    user.isApproved = true;
    await user.save();

    res.json({ message: 'Vendor approved successfully', user });
  } catch (error) {
    console.error('Approve vendor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id/deactivate
// @desc    Deactivate user
// @access  Private (Admin only)
router.put('/users/:id/deactivate', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = false;
    await user.save();

    res.json({ message: 'User deactivated successfully', user });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id/activate
// @desc    Activate user
// @access  Private (Admin only)
router.put('/users/:id/activate', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = true;
    await user.save();

    res.json({ message: 'User activated successfully', user });
  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/vehicles/:id/approve
// @desc    Approve vehicle
// @access  Private (Admin only)
router.put('/vehicles/:id/approve', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    vehicle.isActive = true;
    await vehicle.save();

    res.json({ message: 'Vehicle approved successfully', vehicle });
  } catch (error) {
    console.error('Approve vehicle error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/vehicles/:id/deactivate
// @desc    Deactivate vehicle
// @access  Private (Admin only)
router.put('/vehicles/:id/deactivate', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    vehicle.isActive = false;
    await vehicle.save();

    res.json({ message: 'Vehicle deactivated successfully', vehicle });
  } catch (error) {
    console.error('Deactivate vehicle error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/analytics
// @desc    Get analytics data
// @access  Private (Admin only)
router.get('/analytics', async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const [
      userRegistrations,
      vehicleRegistrations,
      bookingStats,
      revenueStats
    ] = await Promise.all([
      User.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Vehicle.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Booking.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Booking.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: startDate } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$totalAmount' } } },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({
      userRegistrations,
      vehicleRegistrations,
      bookingStats,
      revenueStats
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user (admin only)
// @access  Private (Admin only)
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow admin to delete themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/vehicles/:id
// @desc    Delete vehicle (admin only)
// @access  Private (Admin only)
router.delete('/vehicles/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Check if vehicle has active bookings
    const activeBookings = await Booking.countDocuments({
      vehicleId: vehicle._id,
      status: { $in: ['pending', 'confirmed', 'active'] }
    });

    if (activeBookings > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete vehicle with active bookings' 
      });
    }

    await Vehicle.findByIdAndDelete(req.params.id);

    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/settings
// @desc    Get system settings
// @access  Private (Admin only)
router.get('/settings', [protect, authorize('admin'), waitForDatabase], async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/settings
// @desc    Update system settings
// @access  Private (Admin only)
router.put('/settings', [
  protect, 
  authorize('admin'), 
  waitForDatabase,
  body('siteName').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Site name must be between 1 and 100 characters'),
  body('siteDescription').optional().trim().isLength({ min: 1, max: 500 }).withMessage('Site description must be between 1 and 500 characters'),
  body('contactEmail').optional().isEmail().withMessage('Valid email is required'),
  body('contactPhone').optional().isMobilePhone().withMessage('Valid phone number is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    console.log('Updating settings:', req.body);
    const settings = await Settings.updateSettings(req.body);
    console.log('Settings updated successfully:', settings);
    
    res.json({
      message: 'Settings updated successfully',
      settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
