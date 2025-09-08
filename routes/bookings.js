const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private
router.post('/', [
  protect,
  authorize('user'),
  body('vehicleId').isMongoId().withMessage('Valid vehicle ID is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('pickupLocation').trim().notEmpty().withMessage('Pickup location is required'),
  body('dropLocation').trim().notEmpty().withMessage('Drop location is required'),
  body('driverDetails.name').trim().notEmpty().withMessage('Driver name is required'),
  body('driverDetails.licenseNumber').trim().notEmpty().withMessage('License number is required'),
  body('driverDetails.phone').matches(/^[0-9]{10}$/).withMessage('Valid driver phone number is required')
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
      vehicleId,
      startDate,
      endDate,
      pickupLocation,
      dropLocation,
      driverDetails,
      additionalServices,
      notes
    } = req.body;

    // Check if vehicle exists and is available
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    if (!vehicle.isAvailable) {
      return res.status(400).json({ message: 'Vehicle is not available' });
    }

    // Check for booking conflicts
    const conflictingBooking = await Booking.findOne({
      vehicleId,
      status: { $in: ['pending', 'confirmed', 'active'] },
      $or: [
        {
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(startDate) }
        }
      ]
    });

    if (conflictingBooking) {
      return res.status(400).json({ message: 'Vehicle is already booked for these dates' });
    }

    // Calculate total amount
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    let totalAmount = vehicle.pricePerDay * days;

    // Add additional services cost
    if (additionalServices && additionalServices.length > 0) {
      additionalServices.forEach(service => {
        totalAmount += service.price || 0;
      });
    }

    const booking = await Booking.create({
      userId: req.user._id,
      vehicleId,
      vendorId: vehicle.vendorId,
      startDate,
      endDate,
      totalDays: days,
      totalAmount,
      pickupLocation,
      dropLocation,
      driverDetails,
      additionalServices,
      notes
    });

    // Update vehicle availability
    await Vehicle.findByIdAndUpdate(vehicleId, { isAvailable: false });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('vehicleId')
      .populate('vendorId', 'name phone');

    res.status(201).json(populatedBooking);
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/bookings
// @desc    Get user's bookings
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { userId: req.user._id };
    if (status) {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate('vehicleId', 'name images pricePerDay')
      .populate('vendorId', 'name phone')
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

// @route   GET /api/bookings/vendor
// @desc    Get vendor's bookings
// @access  Private
router.get('/vendor', [protect, authorize('vendor')], async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { vendorId: req.user._id };
    if (status) {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate('vehicleId', 'name images')
      .populate('userId', 'name phone email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(filter);

    // Add customer and vehicle names to bookings for easier display
    const formattedBookings = bookings.map(booking => ({
      ...booking.toObject(),
      customerName: booking.userId?.name || 'Unknown Customer',
      vehicleName: booking.vehicleId?.name || 'Unknown Vehicle'
    }));

    res.json({
      bookings: formattedBookings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalBookings: total
      }
    });
  } catch (error) {
    console.error('Get vendor bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get single booking
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('vehicleId')
      .populate('vendorId', 'name phone email')
      .populate('userId', 'name phone email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is authorized to view this booking
    if (booking.userId._id.toString() !== req.user._id.toString() && 
        booking.vendorId._id.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Get booking error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/bookings/:id/status
// @desc    Update booking status
// @access  Private
router.put('/:id/status', [
  protect,
  body('status').isIn(['pending', 'confirmed', 'active', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('cancellationReason').optional().trim().isLength({ max: 200 }).withMessage('Cancellation reason too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization
    const isVendor = booking.vendorId.toString() === req.user._id.toString();
    const isUser = booking.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isVendor && !isUser && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { status, cancellationReason } = req.body;

    // Update booking status
    booking.status = status;
    if (cancellationReason) {
      booking.cancellationReason = cancellationReason;
    }

    // Handle cancellation
    if (status === 'cancelled') {
      // Calculate refund amount (50% refund if cancelled more than 24 hours before start)
      const now = new Date();
      const hoursUntilStart = (booking.startDate - now) / (1000 * 60 * 60);
      
      if (hoursUntilStart > 24) {
        booking.refundAmount = booking.totalAmount * 0.5;
      } else {
        booking.refundAmount = 0;
      }

      // Make vehicle available again
      await Vehicle.findByIdAndUpdate(booking.vehicleId, { isAvailable: true });
    }

    // Handle completion
    if (status === 'completed') {
      await Vehicle.findByIdAndUpdate(booking.vehicleId, { isAvailable: true });
    }

    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('vehicleId')
      .populate('vendorId', 'name phone')
      .populate('userId', 'name phone');

    res.json(updatedBooking);
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/bookings/:id/payment
// @desc    Process payment for booking
// @access  Private
router.post('/:id/payment', [
  protect,
  authorize('user'),
  body('paymentMethod').isIn(['card', 'upi', 'netbanking', 'cash']).withMessage('Invalid payment method'),
  body('paymentId').optional().trim().notEmpty().withMessage('Payment ID is required for online payments')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Payment already completed' });
    }

    // Process payment (dummy implementation)
    const { paymentMethod, paymentId } = req.body;
    
    // Simulate payment processing
    const paymentSuccess = Math.random() > 0.1; // 90% success rate

    if (paymentSuccess) {
      booking.paymentStatus = 'paid';
      booking.paymentMethod = paymentMethod;
      if (paymentId) {
        booking.paymentId = paymentId;
      }
      await booking.save();

      res.json({ 
        message: 'Payment successful', 
        booking: await Booking.findById(booking._id).populate('vehicleId') 
      });
    } else {
      booking.paymentStatus = 'failed';
      await booking.save();
      
      res.status(400).json({ message: 'Payment failed. Please try again.' });
    }
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

