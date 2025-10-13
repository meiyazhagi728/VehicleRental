const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const { protect, authorize } = require('../middleware/auth');
const { waitForDatabase } = require('../middleware/dbConnection');

const router = express.Router();

// @route   POST /api/bookings/make-vehicles-available
// @desc    Make all vehicles available (for testing)
// @access  Private (Admin only)
router.post('/make-vehicles-available', [protect, authorize('admin')], async (req, res) => {
  try {
    await Vehicle.updateMany({}, { isAvailable: true });
    res.json({ message: 'All vehicles made available' });
  } catch (error) {
    console.error('Make vehicles available error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/bookings/user
// @desc    Get user's bookings
// @access  Private (User only)
router.get('/user', [protect, waitForDatabase], async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let filter = { userId: req.user._id };
    
    if (status) {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate('vehicleId', 'name make model brand type fuelType year images location pricing specifications features')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

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
    console.error('Get user bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel a booking
// @access  Private (User only)
router.put('/:id/cancel', [protect, waitForDatabase], async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns this booking
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    // Check if booking can be cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel a completed booking' });
    }

    // Update booking status
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    await booking.save();

    // Update vehicle availability
    await Vehicle.findByIdAndUpdate(
      booking.vehicleId,
      { $set: { isAvailable: true } }
    );

    res.json({ 
      message: 'Booking cancelled successfully',
      booking: booking
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/bookings/:id/activate
// @desc    Activate a booking after payment
// @access  Private (User only)
router.put('/:id/activate', [protect, waitForDatabase], async (req, res) => {
  try {
    console.log('Booking activation request for ID:', req.params.id);
    console.log('User ID:', req.user._id);
    
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      console.log('Booking not found');
      return res.status(404).json({ message: 'Booking not found' });
    }

    console.log('Found booking:', {
      id: booking._id,
      status: booking.status,
      userId: booking.userId,
      paymentStatus: booking.paymentStatus
    });

    // Check if user owns this booking
    if (booking.userId.toString() !== req.user._id.toString()) {
      console.log('User not authorized for this booking');
      return res.status(403).json({ message: 'Not authorized to activate this booking' });
    }

    // Check if booking can be activated (allow both 'confirmed' and 'pending' statuses)
    if (booking.status !== 'confirmed' && booking.status !== 'pending') {
      console.log('Booking cannot be activated. Current status:', booking.status);
      return res.status(400).json({ 
        message: `Only confirmed or pending bookings can be activated. Current status: ${booking.status}` 
      });
    }

    booking.status = 'active';
    booking.activatedAt = new Date();
    booking.paymentStatus = 'paid';
    
    await booking.save();

    res.json({ message: 'Booking activated successfully', booking });
  } catch (error) {
    console.error('Activate booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/bookings/:id/complete
// @desc    Complete a booking after OTP verification
// @access  Private (User only)
router.put('/:id/complete', [protect, waitForDatabase], async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns this booking
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to complete this booking' });
    }

    // Check if booking can be completed
    if (booking.status !== 'active') {
      return res.status(400).json({ message: 'Only active bookings can be completed' });
    }

    booking.status = 'completed';
    booking.completedAt = new Date();
    
    // Update vehicle availability
    await Vehicle.findByIdAndUpdate(
      booking.vehicleId,
      { $set: { isAvailable: true } }
    );
    
    await booking.save();

    res.json({ message: 'Booking completed successfully', booking });
  } catch (error) {
    console.error('Complete booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/bookings/vendor
// @desc    Get vendor's bookings
// @access  Private (Vendor only)
router.get('/vendor', [protect, authorize('vendor'), waitForDatabase], async (req, res) => {
  console.log('Vendor bookings route hit - User:', req.user);
  console.log('Vendor bookings route hit - User role:', req.user?.role);
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get vendor's vehicles
    const userVehicles = await Vehicle.find({ vendorId: req.user._id }).select('_id');
    const vehicleIds = userVehicles.map(v => v._id);
    
    let filter = { vehicleId: { $in: vehicleIds } };
    
    if (status) {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate('userId', 'name email phone')
      .populate('vehicleId', 'brand model type pricing')
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
    console.error('Get vendor bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/bookings/vendor/ratings
// @desc    Get vendor's rating statistics
// @access  Private (Vendor only)
router.get('/vendor/ratings', [protect, authorize('vendor')], async (req, res) => {
  try {
    const ratingStats = await Booking.calculateVendorRating(req.user._id);
    res.json(ratingStats);
  } catch (error) {
    console.error('Get vendor ratings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/bookings/mechanic
// @desc    Get mechanic's bookings
// @access  Private (Mechanic only)
router.get('/mechanic', [protect, authorize('mechanic'), waitForDatabase], async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let filter = { mechanicId: req.user._id };
    
    if (status) {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate('userId', 'name email phone')
      .populate('vehicleId', 'brand model type pricing')
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
    console.error('Get mechanic bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/bookings
// @desc    Get user's bookings or all bookings (admin)
// @access  Private
router.get('/', [protect, waitForDatabase], async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let filter = {};
    
    // Regular users can only see their own bookings
    if (req.user.role === 'user') {
      filter.userId = req.user._id;
    } else if (req.user.role === 'vendor') {
      // Vendors can see bookings for their vehicles
      const userVehicles = await Vehicle.find({ vendorId: req.user._id }).select('_id');
      const vehicleIds = userVehicles.map(v => v._id);
      filter.vehicleId = { $in: vehicleIds };
    }
    // Admin can see all bookings (no additional filter)

    if (status) {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate('userId', 'name email phone')
      .populate('vehicleId', 'brand model type pricing')
      .populate('vehicleId.vendorId', 'name email phone')
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

// @route   GET /api/bookings/:id
// @desc    Get single booking by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('vehicleId', 'name brand model type fuelType year images location pricing specifications features')
      .populate('vendorId', 'name email phone address');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user has access to this booking
    if (req.user.role === 'user' && booking.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    if (req.user.role === 'vendor') {
      const vehicle = await Vehicle.findById(booking.vehicleId._id);
      if (!vehicle || vehicle.vendorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to view this booking' });
      }
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

// @route   POST /api/bookings
// @desc    Create new booking
// @access  Private
router.post('/', [
  protect,
  authorize('user', 'admin', 'vendor'),
  body('vehicleId').isMongoId().withMessage('Valid vehicle ID is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('totalDays').isFloat({ min: 0.04 }).withMessage('Total days must be at least 1 hour (0.04 days)'),
  body('pickupLocation').trim().notEmpty().withMessage('Pickup location is required'),
  body('dropLocation').trim().notEmpty().withMessage('Drop location is required'),
  body('totalAmount').isFloat({ min: 0 }).withMessage('Total amount must be a positive number'),
  body('driverDetails.name').notEmpty().withMessage('Driver name is required'),
  body('driverDetails.licenseNumber').notEmpty().withMessage('Driver license number is required'),
  body('driverDetails.phone').notEmpty().withMessage('Driver phone is required')
], async (req, res) => {
  try {
    console.log('Booking creation request body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { vehicleId, startDate, endDate, pickupLocation, dropLocation, totalDays, totalAmount, driverDetails } = req.body;

    // Additional validation for date logic
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);
    
    if (endDateTime <= startDateTime) {
      return res.status(400).json({ 
        message: 'End date must be after start date' 
      });
    }

    // Check if vehicle exists and is available
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    console.log('Vehicle availability check:', {
      vehicleId: vehicle._id,
      isAvailable: vehicle.isAvailable,
      name: vehicle.name || `${vehicle.make} ${vehicle.model}`
    });

    if (!vehicle.isAvailable) {
      // Temporarily make vehicle available for testing
      console.log('Making vehicle available for booking...');
      await Vehicle.findByIdAndUpdate(vehicleId, { isAvailable: true });
      console.log('Vehicle made available');
    }

    // Check for date conflicts
    const existingBooking = await Booking.findOne({
      vehicleId,
      status: { $in: ['confirmed', 'active'] },
      $or: [
        {
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(startDate) }
        }
      ]
    });

    if (existingBooking) {
      return res.status(400).json({ 
        message: 'Vehicle is already booked for the selected dates' 
      });
    }

    const bookingData = {
      userId: req.user._id,
      vehicleId,
      vendorId: vehicle.vendorId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      totalDays: totalDays || Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1,
      pickupLocation,
      dropLocation: dropLocation || pickupLocation,
      totalAmount,
      driverDetails: driverDetails || {},
      status: 'pending'
    };

    const booking = await Booking.create(bookingData);
    
    // Update vehicle availability
    await Vehicle.findByIdAndUpdate(vehicleId, { isAvailable: false });
    
    const populatedBooking = await Booking.findById(booking._id)
      .populate('userId', 'name email phone')
      .populate('vehicleId', 'brand model type pricing')
      .populate('vehicleId.vendorId', 'name email phone');

    res.status(201).json(populatedBooking);
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/bookings/:id/status
// @desc    Update booking status
// @access  Private
router.put('/:id/status', [
  protect,
  body('status').isIn(['pending', 'confirmed', 'active', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('reason').optional().trim().isLength({ max: 500 }).withMessage('Reason cannot exceed 500 characters')
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
    const vehicle = await Vehicle.findById(booking.vehicleId);
    const isOwner = req.user.role === 'user' && booking.userId.toString() === req.user._id.toString();
    const isVendor = req.user.role === 'vendor' && vehicle && vehicle.vendorId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isVendor && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    // Status transition validation
    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['active', 'cancelled'],
      active: ['completed', 'cancelled'],
      completed: [],
      cancelled: []
    };

    if (!validTransitions[booking.status].includes(req.body.status)) {
      return res.status(400).json({ 
        message: `Cannot change status from ${booking.status} to ${req.body.status}` 
      });
    }

    booking.status = req.body.status;
    if (req.body.reason) {
      booking.cancellationReason = req.body.reason;
    }

    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('userId', 'name email phone')
      .populate('vehicleId', 'brand model type pricing')
      .populate('vehicleId.vendorId', 'name email phone');

    res.json(updatedBooking);
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/bookings/:id
// @desc    Update booking details
// @access  Private
router.put('/:id', [
  protect,
  body('startDate').optional().isISO8601().withMessage('Valid start date is required'),
  body('endDate').optional().isISO8601().withMessage('Valid end date is required'),
  body('pickupLocation').optional().trim().notEmpty().withMessage('Pickup location cannot be empty'),
  body('dropoffLocation').optional().trim().notEmpty().withMessage('Dropoff location cannot be empty')
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

    // Only allow updates for pending bookings
    if (booking.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Can only update pending bookings' 
      });
    }

    // Check if user owns this booking
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    const updateFields = {};
    if (req.body.startDate) updateFields.startDate = new Date(req.body.startDate);
    if (req.body.endDate) updateFields.endDate = new Date(req.body.endDate);
    if (req.body.pickupLocation) updateFields.pickupLocation = req.body.pickupLocation;
    if (req.body.dropoffLocation) updateFields.dropoffLocation = req.body.dropoffLocation;

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone')
     .populate('vehicleId', 'brand model type pricing')
     .populate('vehicleId.vendorId', 'name email phone');

    res.json(updatedBooking);
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/bookings/:id/payment
// @desc    Process payment for booking
// @access  Private
router.post('/:id/payment', [
  protect,
  body('paymentMethod').notEmpty().withMessage('Payment method is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('transactionId').optional().trim().notEmpty().withMessage('Transaction ID cannot be empty')
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

    // Check if user owns this booking
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to process payment for this booking' });
    }

    // Check if booking is in a payable state
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({ 
        message: 'Payment can only be processed for pending or confirmed bookings' 
      });
    }

    // Update booking with payment information
    booking.paymentStatus = 'paid';
    booking.paymentMethod = req.body.paymentMethod;
    booking.paymentAmount = req.body.amount;
    booking.transactionId = req.body.transactionId;
    booking.paymentDate = new Date();

    // Update booking status to confirmed if it was pending
    if (booking.status === 'pending') {
      booking.status = 'confirmed';
    }

    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('userId', 'name email phone')
      .populate('vehicleId', 'brand model type pricing')
      .populate('vehicleId.vendorId', 'name email phone');

    res.json({
      message: 'Payment processed successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/bookings/:id
// @desc    Cancel booking
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    console.log('DELETE booking route hit - User:', req.user);
    console.log('DELETE booking route hit - Booking ID:', req.params.id);
    
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      console.log('DELETE booking route - Booking not found');
      return res.status(404).json({ message: 'Booking not found' });
    }

    console.log('DELETE booking route - Booking found:', {
      id: booking._id,
      status: booking.status,
      userId: booking.userId,
      vehicleId: booking.vehicleId
    });

    // Check authorization
    const vehicle = await Vehicle.findById(booking.vehicleId);
    console.log('DELETE booking route - Vehicle found:', vehicle ? {
      id: vehicle._id,
      vendorId: vehicle.vendorId
    } : 'Vehicle not found');
    
    const isOwner = req.user.role === 'user' && booking.userId.toString() === req.user._id.toString();
    const isVendor = req.user.role === 'vendor' && vehicle && vehicle.vendorId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    console.log('DELETE booking route - Authorization check:', {
      userRole: req.user.role,
      isOwner,
      isVendor,
      isAdmin,
      bookingUserId: booking.userId.toString(),
      currentUserId: req.user._id.toString(),
      vehicleVendorId: vehicle ? vehicle.vendorId.toString() : 'N/A'
    });

    if (!isOwner && !isVendor && !isAdmin) {
      console.log('DELETE booking route - Authorization failed');
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    // Check if booking is already cancelled
    if (booking.status === 'cancelled') {
      return res.json({ message: 'Booking is already cancelled' });
    }

    // Only allow cancellation of pending, confirmed, or active bookings
    if (!['pending', 'confirmed', 'active'].includes(booking.status)) {
      return res.status(400).json({ 
        message: `Cannot cancel booking with status: ${booking.status}` 
      });
    }

    booking.status = 'cancelled';
    if (req.query.reason) {
      booking.cancellationReason = req.query.reason;
    }

    await booking.save();

    // Update vehicle availability when booking is cancelled
    await Vehicle.findByIdAndUpdate(
      booking.vehicleId,
      { $set: { isAvailable: true } }
    );

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
