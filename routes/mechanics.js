const express = require('express');
const { body, validationResult } = require('express-validator');
const Mechanic = require('../models/Mechanic');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/mechanics
// @desc    Get all mechanics
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { specialization, city, available, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { isActive: true };
    
    if (specialization) {
      filter.specialization = { $regex: specialization, $options: 'i' };
    }
    
    if (city) {
      filter['address.city'] = { $regex: city, $options: 'i' };
    }
    
    if (available === 'true') {
      filter.availability = true;
    }

    const mechanics = await Mechanic.find(filter)
      .populate('userId', 'name phone email')
      .sort({ rating: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Mechanic.countDocuments(filter);

    res.json({
      mechanics,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalMechanics: total
      }
    });
  } catch (error) {
    console.error('Get mechanics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/mechanics/nearby
// @desc    Get nearby mechanics using GPS coordinates
// @access  Public
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, maxDistance = 10 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const coordinates = [parseFloat(lng), parseFloat(lat)];
    const mechanics = await Mechanic.findNearby(coordinates, parseFloat(maxDistance));

    res.json({
      mechanics,
      userLocation: { lat: parseFloat(lat), lng: parseFloat(lng) },
      maxDistance: parseFloat(maxDistance)
    });
  } catch (error) {
    console.error('Get nearby mechanics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/mechanics/:id
// @desc    Get single mechanic by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const mechanic = await Mechanic.findById(req.params.id)
      .populate('userId', 'name phone email')
      .populate('reviews.userId', 'name');

    if (!mechanic) {
      return res.status(404).json({ message: 'Mechanic not found' });
    }

    res.json(mechanic);
  } catch (error) {
    console.error('Get mechanic error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Mechanic not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/mechanics
// @desc    Create mechanic profile
// @access  Private
router.post('/', [
  protect,
  authorize('mechanic'),
  body('specialization').trim().notEmpty().withMessage('Specialization is required'),
  body('experience').isInt({ min: 0 }).withMessage('Experience must be a positive number'),
  body('services').isArray({ min: 1 }).withMessage('At least one service is required'),
  body('address.street').trim().notEmpty().withMessage('Street address is required'),
  body('address.city').trim().notEmpty().withMessage('City is required'),
  body('address.state').trim().notEmpty().withMessage('State is required'),
  body('address.pincode').trim().notEmpty().withMessage('Pincode is required'),
  body('contactInfo.phone').matches(/^[0-9]{10}$/).withMessage('Valid phone number is required'),
  body('contactInfo.email').isEmail().withMessage('Valid email is required'),
  body('documents.license').trim().notEmpty().withMessage('License is required'),
  body('pricing.hourlyRate').isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    // Check if mechanic profile already exists
    const existingMechanic = await Mechanic.findOne({ userId: req.user._id });
    if (existingMechanic) {
      return res.status(400).json({ message: 'Mechanic profile already exists' });
    }

    const mechanicData = {
      ...req.body,
      userId: req.user._id
    };

    const mechanic = await Mechanic.create(mechanicData);
    const populatedMechanic = await Mechanic.findById(mechanic._id)
      .populate('userId', 'name phone email');

    res.status(201).json(populatedMechanic);
  } catch (error) {
    console.error('Create mechanic error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/mechanics/profile
// @desc    Update mechanic profile
// @access  Private
router.put('/profile', [
  protect,
  authorize('mechanic'),
  body('specialization').optional().trim().notEmpty().withMessage('Specialization cannot be empty'),
  body('experience').optional().isInt({ min: 0 }).withMessage('Experience must be a positive number'),
  body('pricing.hourlyRate').optional().isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const mechanic = await Mechanic.findOne({ userId: req.user._id });
    
    if (!mechanic) {
      return res.status(404).json({ message: 'Mechanic profile not found' });
    }

    const updatedMechanic = await Mechanic.findByIdAndUpdate(
      mechanic._id,
      req.body,
      { new: true, runValidators: true }
    ).populate('userId', 'name phone email');

    res.json(updatedMechanic);
  } catch (error) {
    console.error('Update mechanic profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/mechanics/availability
// @desc    Update mechanic availability
// @access  Private
router.put('/availability', [
  protect,
  authorize('mechanic'),
  body('availability').isBoolean().withMessage('Availability must be a boolean'),
  body('workingHours.start').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format'),
  body('workingHours.end').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format'),
  body('workingDays').optional().isArray().withMessage('Working days must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const mechanic = await Mechanic.findOne({ userId: req.user._id });
    
    if (!mechanic) {
      return res.status(404).json({ message: 'Mechanic profile not found' });
    }

    const { availability, workingHours, workingDays } = req.body;
    
    if (availability !== undefined) mechanic.availability = availability;
    if (workingHours) mechanic.workingHours = workingHours;
    if (workingDays) mechanic.workingDays = workingDays;

    await mechanic.save();

    res.json({ message: 'Availability updated successfully', mechanic });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/mechanics/:id/reviews
// @desc    Add review to mechanic
// @access  Private
router.post('/:id/reviews', [
  protect,
  authorize('user'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const mechanic = await Mechanic.findById(req.params.id);

    if (!mechanic) {
      return res.status(404).json({ message: 'Mechanic not found' });
    }

    // Check if user already reviewed this mechanic
    const alreadyReviewed = mechanic.reviews.find(
      review => review.userId.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Mechanic already reviewed' });
    }

    const review = {
      userId: req.user._id,
      rating: req.body.rating,
      comment: req.body.comment,
      date: new Date()
    };

    mechanic.reviews.push(review);
    await mechanic.calculateAverageRating();

    const updatedMechanic = await Mechanic.findById(mechanic._id)
      .populate('userId', 'name phone email')
      .populate('reviews.userId', 'name');

    res.status(201).json(updatedMechanic);
  } catch (error) {
    console.error('Add mechanic review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
