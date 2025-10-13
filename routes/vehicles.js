const express = require('express');
const { body, validationResult } = require('express-validator');
const Vehicle = require('../models/Vehicle');
const { protect, authorize } = require('../middleware/auth');
const { waitForDatabase } = require('../middleware/dbConnection');

// Simple in-memory cache for vehicle data
const vehicleCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

// Cache invalidation function
const invalidateVehicleCache = () => {
  vehicleCache.clear();
  console.log('Vehicle cache cleared');
};

const router = express.Router();

// @route   GET /api/vehicles
// @desc    Get all vehicles with optimized filtering and pagination
// @access  Public
router.get('/', waitForDatabase, async (req, res) => {
  try {
    const { 
      search,
      type, 
      brand, 
      model, 
      city, 
      available, 
      minPrice, 
      maxPrice,
      fuelType,
      page = 1, 
      limit = 10 
    } = req.query;
    
    // Create cache key from query parameters
    const cacheKey = JSON.stringify({ search, type, brand, model, city, available, minPrice, maxPrice, fuelType, page, limit });
    
    // Check cache first
    const cached = vehicleCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      return res.json(cached.data);
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = {};

    // Optimized search across multiple fields with better indexing
    if (search) {
      filter.$or = [
        { make: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'location.state': { $regex: search, $options: 'i' } }
      ];
    }

    // Apply specific filters with exact matches when possible
    if (type) filter.type = type; // Use exact match instead of regex for better performance
    if (brand) filter.make = { $regex: brand, $options: 'i' };
    if (model) filter.model = { $regex: model, $options: 'i' };
    if (city) filter['location.city'] = { $regex: city, $options: 'i' };
    if (fuelType) filter.fuelType = fuelType; // Use exact match
    if (available === 'true') filter.isAvailable = true;
    
    // Price range filter with numeric comparison
    if (minPrice || maxPrice) {
      filter.pricePerDay = {};
      if (minPrice) filter.pricePerDay.$gte = parseFloat(minPrice);
      if (maxPrice) filter.pricePerDay.$lte = parseFloat(maxPrice);
    }

    // Optimized query with projection to reduce data transfer
    const projection = {
      make: 1, model: 1, type: 1, fuelType: 1, pricePerDay: 1, 
      isAvailable: 1, images: 1, location: 1, vendorId: 1, 
      rating: 1, features: 1, createdAt: 1
    };

    // Execute queries in parallel for better performance
    const [vehicles, total] = await Promise.all([
      Vehicle.find(filter, projection)
        .populate('vendorId', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Vehicle.countDocuments(filter)
    ]);

    const response = {
      vehicles,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalVehicles: total
      }
    };

    // Cache the response
    vehicleCache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    });

    // Clean old cache entries periodically
    if (vehicleCache.size > 100) {
      const now = Date.now();
      for (const [key, value] of vehicleCache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
          vehicleCache.delete(key);
        }
      }
    }

    res.json(response);
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/vehicles/nearby
// @desc    Get nearby vehicles using GPS coordinates
// @access  Public
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, maxDistance = 10 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const coordinates = [parseFloat(lng), parseFloat(lat)];
    const vehicles = await Vehicle.findNearby(coordinates, parseFloat(maxDistance));

    res.json({
      vehicles,
      userLocation: { lat: parseFloat(lat), lng: parseFloat(lng) },
      maxDistance: parseFloat(maxDistance)
    });
  } catch (error) {
    console.error('Get nearby vehicles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/vehicles/vendor
// @desc    Get vehicles for specific vendor
// @access  Private (vendor only)
router.get('/vendor', [protect, authorize('vendor')], async (req, res) => {
  console.log('Vendor vehicles route hit - User:', req.user);
  console.log('Vendor vehicles route hit - User role:', req.user?.role);
  try {
    const vehicles = await Vehicle.find({ vendorId: req.user._id })
      .populate('vendorId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(vehicles);
  } catch (error) {
    console.error('Error fetching vendor vehicles:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/vehicles/:id
// @desc    Get single vehicle by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('vendorId', 'name email phone')
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
// @desc    Create new vehicle (vendor only)
// @access  Private
router.post('/', [
  protect,
  authorize('vendor'),
  body('name').trim().notEmpty().withMessage('Vehicle name is required'),
  body('type').isIn(['Car', 'Bike', 'SUV', 'Van', 'Truck', 'Bus', 'Auto']).withMessage('Invalid vehicle type'),
  body('fuelType').isIn(['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG']).withMessage('Invalid fuel type'),
  body('brand').trim().notEmpty().withMessage('Brand is required'),
  body('model').trim().notEmpty().withMessage('Model is required'),
  body('year').isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Invalid year'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('pricePerDay').isFloat({ min: 0 }).withMessage('Price per day must be a positive number'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('images').isArray({ min: 1 }).withMessage('At least one image is required'),
  body('specifications.seats').isInt({ min: 1 }).withMessage('Number of seats is required'),
  body('specifications.transmission').isIn(['Manual', 'Automatic']).withMessage('Invalid transmission type'),
  body('specifications.mileage').isFloat({ min: 0 }).withMessage('Mileage must be a positive number'),
  body('specifications.engineCapacity').trim().notEmpty().withMessage('Engine capacity is required'),
  body('specifications.color').trim().notEmpty().withMessage('Color is required'),
  body('specifications.registrationNumber').trim().notEmpty().withMessage('Registration number is required')
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
    const populatedVehicle = await Vehicle.findById(vehicle._id)
      .populate('vendorId', 'name email phone');

    // Invalidate cache when new vehicle is created
    invalidateVehicleCache();

    res.status(201).json(populatedVehicle);
  } catch (error) {
    console.error('Create vehicle error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/vehicles/:id
// @desc    Update vehicle (vendor only)
// @access  Private
router.put('/:id', [
  protect,
  authorize('vendor'),
  body('name').optional().trim().notEmpty().withMessage('Vehicle name cannot be empty'),
  body('type').optional().isIn(['Car', 'Bike', 'SUV', 'Van', 'Truck', 'Bus', 'Auto']).withMessage('Invalid vehicle type'),
  body('fuelType').optional().isIn(['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG']).withMessage('Invalid fuel type'),
  body('brand').optional().trim().notEmpty().withMessage('Brand cannot be empty'),
  body('model').optional().trim().notEmpty().withMessage('Model cannot be empty'),
  body('year').optional().isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Invalid year'),
  body('description').optional().trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('pricePerDay').optional().isFloat({ min: 0 }).withMessage('Price per day must be a positive number'),
  body('location').optional().trim().notEmpty().withMessage('Location cannot be empty'),
  body('images').optional().isArray({ min: 1 }).withMessage('At least one image is required'),
  body('specifications.seats').optional().isInt({ min: 1 }).withMessage('Number of seats must be at least 1'),
  body('specifications.transmission').optional().isIn(['Manual', 'Automatic']).withMessage('Invalid transmission type'),
  body('specifications.mileage').optional().isFloat({ min: 0 }).withMessage('Mileage must be a positive number'),
  body('specifications.engineCapacity').optional().trim().notEmpty().withMessage('Engine capacity cannot be empty'),
  body('specifications.color').optional().trim().notEmpty().withMessage('Color cannot be empty'),
  body('specifications.registrationNumber').optional().trim().notEmpty().withMessage('Registration number cannot be empty'),
  body('specifications.insuranceExpiry').optional().isISO8601().withMessage('Valid insurance expiry date is required'),
  body('specifications.permitExpiry').optional().isISO8601().withMessage('Valid permit expiry date is required')
], async (req, res) => {
  try {
    console.log('Update vehicle request body:', JSON.stringify(req.body, null, 2));
    console.log('Update vehicle params:', req.params);
    console.log('User ID:', req.user?._id);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Check if user owns this vehicle
    if (vehicle.vendorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this vehicle' });
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('vendorId', 'name email phone');

    // Invalidate cache when vehicle is updated
    invalidateVehicleCache();

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

    // Check if user owns this vehicle
    if (vehicle.vendorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this vehicle' });
    }

    await Vehicle.findByIdAndDelete(req.params.id);

    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/vehicles/:id/reviews
// @desc    Add review to vehicle
// @access  Private
router.post('/:id/reviews', [
  protect,
  authorize(['user', 'admin']),
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

    const updatedVehicle = await Vehicle.findById(vehicle._id)
      .populate('vendorId', 'name email phone')
      .populate('reviews.userId', 'name');

    res.status(201).json(updatedVehicle);
  } catch (error) {
    console.error('Add vehicle review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/vehicles/:id/availability
// @desc    Update vehicle availability status
// @access  Private
router.put('/:id/availability', [
  protect,
  body('isAvailable').optional().isBoolean().withMessage('isAvailable must be a boolean'),
  body('availability').optional().isBoolean().withMessage('availability must be a boolean')
], async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Check authorization - allow vendors to update their own vehicles, admins to update any
    const isVendor = req.user.role === 'vendor' && vehicle.vendorId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isVendor && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this vehicle' });
    }

    // Update isAvailable if provided (for booking system)
    if (req.body.isAvailable !== undefined) {
      vehicle.isAvailable = req.body.isAvailable;
    }
    
    // Update availability if provided (for vendor management)
    if (req.body.availability !== undefined) {
      vehicle.availability = req.body.availability;
    }

    await vehicle.save();

    // Invalidate cache when vehicle availability is updated
    invalidateVehicleCache();

    res.json({ message: 'Vehicle availability updated successfully', vehicle });
  } catch (error) {
    console.error('Update vehicle availability error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
