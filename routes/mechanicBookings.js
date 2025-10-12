const express = require('express');
const { body, validationResult } = require('express-validator');
const MechanicBooking = require('../models/MechanicBooking');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/mechanics/book
// @desc    Book a mechanic service
// @access  Private
router.post('/book', [
  protect,
  body('mechanicId').isMongoId().withMessage('Valid mechanic ID is required'),
  body('serviceType').notEmpty().withMessage('Service type is required'),
  body('description').isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters'),
  body('preferredDate').isISO8601().withMessage('Valid date is required'),
  body('location').isLength({ min: 5, max: 200 }).withMessage('Location must be between 5 and 200 characters'),
  body('contactPhone').isMobilePhone().withMessage('Valid phone number is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      mechanicId,
      serviceType,
      description,
      preferredDate,
      preferredTime,
      location,
      contactPhone,
      estimatedDuration
    } = req.body;

    // Check if mechanic exists and is available
    const mechanic = await User.findById(mechanicId);
    if (!mechanic || mechanic.role !== 'mechanic') {
      return res.status(404).json({ message: 'Mechanic not found' });
    }

    if (!mechanic.availability) {
      return res.status(400).json({ message: 'Mechanic is not available for bookings' });
    }

    // Check if date is not in the past
    const bookingDate = new Date(preferredDate);
    if (bookingDate < new Date()) {
      return res.status(400).json({ message: 'Booking date cannot be in the past' });
    }

    // Create the booking
    const booking = new MechanicBooking({
      customerId: req.user._id,
      mechanicId,
      serviceType,
      description,
      preferredDate: bookingDate,
      preferredTime,
      location,
      contactPhone,
      estimatedDuration: estimatedDuration || '1 hour'
    });

    await booking.save();

    // Populate the booking with customer and mechanic details
    await booking.populate([
      { path: 'customerId', select: 'name email phone' },
      { path: 'mechanicId', select: 'name email phone specialization' }
    ]);

    res.status(201).json({
      message: 'Mechanic booking request submitted successfully',
      booking
    });

  } catch (error) {
    console.error('Create mechanic booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/mechanics/bookings/customer
// @desc    Get customer's mechanic bookings
// @access  Private
router.get('/bookings/customer', protect, async (req, res) => {
  try {
    const { status } = req.query;
    const bookings = await MechanicBooking.getByCustomer(req.user._id, status);
    
    res.json({
      bookings,
      count: bookings.length
    });
  } catch (error) {
    console.error('Get customer bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/mechanics/bookings/mechanic
// @desc    Get mechanic's bookings
// @access  Private
router.get('/bookings/mechanic', [protect, authorize('mechanic')], async (req, res) => {
  try {
    const { status, hasReview } = req.query;
    const bookings = await MechanicBooking.getByMechanic(req.user._id, status, hasReview === 'true');
    
    res.json({
      bookings,
      count: bookings.length
    });
  } catch (error) {
    console.error('Get mechanic bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/mechanics/bookings/:id/status
// @desc    Update booking status
// @access  Private
router.put('/bookings/:id/status', [
  protect,
  body('status').isIn(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status, notes, totalCost } = req.body;
    const bookingId = req.params.id;

    const booking = await MechanicBooking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is authorized to update this booking
    const isMechanic = req.user.role === 'mechanic' && booking.mechanicId.toString() === req.user._id.toString();
    const isCustomer = booking.customerId.toString() === req.user._id.toString();

    if (!isMechanic && !isCustomer) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    // Update booking
    booking.status = status;
    if (notes) booking.notes = notes;
    if (totalCost) booking.totalCost = totalCost;

    // Set timestamps for status changes
    if (status === 'in_progress' && !booking.actualStartTime) {
      booking.actualStartTime = new Date();
    }
    if (status === 'completed' && !booking.actualEndTime) {
      booking.actualEndTime = new Date();
    }

    await booking.save();

    // Populate the updated booking
    await booking.populate([
      { path: 'customerId', select: 'name email phone' },
      { path: 'mechanicId', select: 'name email phone specialization' }
    ]);

    res.json({
      message: 'Booking status updated successfully',
      booking
    });

  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/mechanics/bookings/:id/rate
// @desc    Rate and review a completed booking
// @access  Private
router.post('/bookings/:id/rate', [
  protect,
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').optional().isLength({ max: 300 }).withMessage('Review cannot exceed 300 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { rating, review } = req.body;
    const bookingId = req.params.id;

    const booking = await MechanicBooking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is the customer
    if (booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to rate this booking' });
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Can only rate completed bookings' });
    }

    // Update booking with rating and review
    booking.rating = rating;
    if (review) booking.review = review;

    await booking.save();

    // Update mechanic's average rating
    const mechanic = await User.findById(booking.mechanicId);
    if (mechanic) {
      const allBookings = await MechanicBooking.find({
        mechanicId: booking.mechanicId,
        rating: { $exists: true }
      });

      const totalRating = allBookings.reduce((sum, b) => sum + b.rating, 0);
      const averageRating = totalRating / allBookings.length;

      mechanic.rating = Math.round(averageRating * 10) / 10; // Round to 1 decimal
      mechanic.totalReviews = allBookings.length;
      await mechanic.save();
    }

    res.json({
      message: 'Rating submitted successfully',
      booking
    });

  } catch (error) {
    console.error('Rate booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/mechanics/bookings/:id
// @desc    Get single booking details
// @access  Private
router.get('/bookings/:id', protect, async (req, res) => {
  try {
    const booking = await MechanicBooking.findById(req.params.id)
      .populate('customerId', 'name email phone')
      .populate('mechanicId', 'name email phone specialization');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is authorized to view this booking
    const isMechanic = req.user.role === 'mechanic' && booking.mechanicId._id.toString() === req.user._id.toString();
    const isCustomer = booking.customerId._id.toString() === req.user._id.toString();

    if (!isMechanic && !isCustomer) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.json({ booking });

  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/mechanics/bookings/all
// @desc    Get all mechanic bookings (admin/vendor access)
// @access  Private (Admin/Vendor only)
router.get('/bookings/all', [protect, authorize('admin', 'vendor')], async (req, res) => {
  try {
    const { status, serviceType, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (serviceType && serviceType !== 'all') {
      query.serviceType = serviceType;
    }

    // Get bookings with pagination
    const bookings = await MechanicBooking.find(query)
      .populate('customerId', 'name email phone')
      .populate('mechanicId', 'name email phone specialization')
      .sort({ preferredDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await MechanicBooking.countDocuments(query);

    res.json({
      bookings,
      count: bookings.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page)
    });

  } catch (error) {
    console.error('Get all mechanic bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
