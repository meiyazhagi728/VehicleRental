const express = require('express');
const { body, validationResult } = require('express-validator');
const Vehicle = require('../models/Vehicle');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/vehicles
// @desc    Get all vehicles with search and filter
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      search,
      type,
      fuelType,
      minPrice,
      maxPrice,
      location,
      available,
      page = 1,
      limit = 10
    } = req.query;

    // Build filter object
    const filter = {};

    // Search functionality
    if (search) {
      filter.$text = { $search: search };
    }

    // Filter by vehicle type
    if (type) {
      filter.type = type;
    }

    // Filter by fuel type
    if (fuelType) {
      filter.fuelType = fuelType;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      filter.pricePerDay = {};
      if (minPrice) filter.pricePerDay.$gte = parseFloat(minPrice);
      if (maxPrice) filter.pricePerDay.$lte = parseFloat(maxPrice);
    }

    // Filter by location (Tamil Nadu focus)
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    // Filter by availability
    if (available === 'true') {
      filter.isAvailable = true;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const vehicles = await Vehicle.find(filter)
      .populate('vendorId', 'name phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Vehicle.countDocuments(filter);

    res.json({
      vehicles,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalVehicles: total,
        hasNextPage: skip + vehicles.length < total,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/vehicles/:id
// @desc    Get single vehicle by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('vendorId', 'name phone email')
      .populate('reviews.userId', 'name');

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.json(vehicle);
  } catch (error) {
    console.error('Get vehicle error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/vehicles
// @desc    Create a new vehicle (vendor only)
// @access  Private
router.post('/', [
  protect,
  authorize('vendor'),
  body('name').trim().isLength({ min: 2 }).withMessage('Vehicle name is required'),
  body('type').isIn(['Car', 'Bike', 'SUV', 'Van', 'Truck', 'Bus', 'Auto']).withMessage('Invalid vehicle type'),
  body('fuelType').isIn(['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG']).withMessage('Invalid fuel type'),
  body('brand').trim().notEmpty().withMessage('Brand is required'),
  body('model').trim().notEmpty().withMessage('Model is required'),
  body('year').isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Invalid year'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('pricePerDay').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('images').isArray({ min: 1 }).withMessage('At least one image is required'),
  body('specifications.seats').isInt({ min: 1 }).withMessage('Number of seats is required'),
  body('specifications.transmission').isIn(['Manual', 'Automatic']).withMessage('Invalid transmission type'),
  body('specifications.mileage').isFloat({ min: 0 }).withMessage('Mileage must be a positive number'),
  body('specifications.engineCapacity').trim().notEmpty().withMessage('Engine capacity is required'),
  body('specifications.color').trim().notEmpty().withMessage('Color is required'),
  body('specifications.registrationNumber').trim().notEmpty().withMessage('Registration number is required'),
  body('specifications.insuranceExpiry').isISO8601().withMessage('Valid insurance expiry date is required'),
  body('specifications.permitExpiry').isISO8601().withMessage('Valid permit expiry date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const vehicleData = {
      ...req.body,
      vendorId: req.user._id
    };

    const vehicle = await Vehicle.create(vehicleData);

    res.status(201).json(vehicle);
  } catch (error) {
    console.error('Create vehicle error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Registration number already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/vehicles/:id
// @desc    Update vehicle (vendor only)
// @access  Private
router.put('/:id', [
  protect,
  authorize('vendor'),
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Vehicle name must be at least 2 characters'),
  body('pricePerDay').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('description').optional().trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Check if vehicle belongs to the vendor
    if (vehicle.vendorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this vehicle' });
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedVehicle);
  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/vehicles/:id
// @desc    Delete vehicle (vendor only)
// @access  Private
router.delete('/:id', [protect, authorize('vendor')], async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Check if vehicle belongs to the vendor
    if (vehicle.vendorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this vehicle' });
    }

    await Vehicle.findByIdAndDelete(req.params.id);

    res.json({ message: 'Vehicle removed' });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/vehicles/:id/reviews
// @desc    Add review to vehicle (user only)
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

    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Check if user already reviewed this vehicle
    const alreadyReviewed = vehicle.reviews.find(
      review => review.userId.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Vehicle already reviewed' });
    }

    const review = {
      userId: req.user._id,
      rating: req.body.rating,
      comment: req.body.comment,
      date: new Date()
    };

    vehicle.reviews.push(review);
    await vehicle.calculateAverageRating();

    res.status(201).json(vehicle);
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/vehicles/vendor
// @desc    Get vendor's vehicles
// @access  Private (Vendor only)
router.get('/vendor', [protect, authorize('vendor')], async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ vendorId: req.user._id })
      .populate('reviews.userId', 'name')
      .sort({ createdAt: -1 });

    res.json(vehicles);
  } catch (error) {
    console.error('Get vendor vehicles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/vehicles/vendor/mechanics
// @desc    Get vendor's associated mechanics
// @access  Private (Vendor only)
router.get('/vendor/mechanics', [protect, authorize('vendor')], async (req, res) => {
  try {
    const Mechanic = require('../models/Mechanic');
    
    // For now, return all mechanics as associated
    // In a real implementation, you would have a VendorMechanic association model
    const mechanics = await Mechanic.find({ availability: true })
      .populate('userId', 'name phone email')
      .limit(10);

    res.json(mechanics);
  } catch (error) {
    console.error('Get vendor mechanics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/vehicles/vendor/mechanics/:id/associate
// @desc    Associate a mechanic with vendor
// @access  Private (Vendor only)
router.post('/vendor/mechanics/:id/associate', [protect, authorize('vendor')], async (req, res) => {
  try {
    const Mechanic = require('../models/Mechanic');
    
    const mechanic = await Mechanic.findById(req.params.id);
    if (!mechanic) {
      return res.status(404).json({ message: 'Mechanic not found' });
    }

    // In a real implementation, you would create an association record
    // For now, just return success
    res.json({ 
      message: 'Mechanic associated successfully',
      mechanic: mechanic
    });
  } catch (error) {
    console.error('Associate mechanic error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/vehicles/vendor/mechanics/:id/disassociate
// @desc    Disassociate a mechanic from vendor
// @access  Private (Vendor only)
router.delete('/vendor/mechanics/:id/disassociate', [protect, authorize('vendor')], async (req, res) => {
  try {
    const Mechanic = require('../models/Mechanic');
    
    const mechanic = await Mechanic.findById(req.params.id);
    if (!mechanic) {
      return res.status(404).json({ message: 'Mechanic not found' });
    }

    // In a real implementation, you would remove the association record
    // For now, just return success
    res.json({ 
      message: 'Mechanic disassociated successfully'
    });
  } catch (error) {
    console.error('Disassociate mechanic error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
