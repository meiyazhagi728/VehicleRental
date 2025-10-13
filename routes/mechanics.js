const express = require('express');
const { body, validationResult } = require('express-validator');
const Mechanic = require('../models/Mechanic');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { waitForDatabase } = require('../middleware/dbConnection');

const router = express.Router();


// @route   GET /api/mechanics
// @desc    Get all mechanics (including users with mechanic role)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      specialization, 
      city, 
      available, 
      search,
      experience,
      rating,
      page = 1, 
      limit = 10 
    } = req.query;
    
    console.log('Mechanics API called with filters:', {
      specialization,
      city,
      available,
      search,
      experience,
      rating,
      page,
      limit
    });
    
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get users with mechanic role
    const userFilter = { role: 'mechanic' };
    
    if (city) {
      userFilter['address.city'] = { $regex: city, $options: 'i' };
    }
    
    if (search) {
      userFilter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (available === 'true') {
      userFilter.availability = true;
    } else if (available === 'false') {
      userFilter.availability = false;
    }
    
    const usersWithMechanicRole = await User.find(userFilter)
      .select('name email phone address role createdAt availability specialization rating experience')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get mechanics from Mechanic collection
    const mechanicFilter = {};
    
    if (specialization) {
      mechanicFilter.specialization = { $regex: specialization, $options: 'i' };
    }
    
    if (city) {
      mechanicFilter['address.city'] = { $regex: city, $options: 'i' };
    }
    
    if (search) {
      mechanicFilter.$or = [
        { specialization: { $regex: search, $options: 'i' } },
        { 'userId.name': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (experience) {
      if (experience === '0-2') {
        mechanicFilter.experience = { $gte: 0, $lte: 2 };
      } else if (experience === '3-5') {
        mechanicFilter.experience = { $gte: 3, $lte: 5 };
      } else if (experience === '6-10') {
        mechanicFilter.experience = { $gte: 6, $lte: 10 };
      } else if (experience === '10+') {
        mechanicFilter.experience = { $gte: 10 };
      }
    }
    
    if (rating) {
      mechanicFilter.rating = { $gte: parseFloat(rating) };
    }
    
    if (available === 'true') {
      mechanicFilter.availability = true;
    } else if (available === 'false') {
      mechanicFilter.availability = false;
    }
    
    const mechanics = await Mechanic.find(mechanicFilter)
      .populate('userId', 'name phone email')
      .sort({ rating: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Combine both results
    const allMechanics = [
      ...usersWithMechanicRole.map(user => ({
        _id: user._id,
        userId: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone
        },
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        isUserMechanic: true,
        rating: user.rating || 0,
        totalReviews: user.totalReviews || 0,
        specialization: user.specialization || 'General Mechanic',
        experience: user.experience || 0,
        availability: user.availability !== undefined ? user.availability : true,
        services: user.services || [],
        pricing: user.pricing || { hourlyRate: 0 }
      })),
      ...mechanics.map(mechanic => ({
        ...mechanic.toObject(),
        isUserMechanic: false
      }))
    ];

    // Apply additional client-side filtering for combined results
    let filteredMechanics = allMechanics;

    // Filter by specialization
    if (specialization) {
      filteredMechanics = filteredMechanics.filter(mechanic => 
        mechanic.specialization && 
        mechanic.specialization.toLowerCase().includes(specialization.toLowerCase())
      );
    }

    // Filter by rating
    if (rating) {
      const minRating = parseFloat(rating);
      filteredMechanics = filteredMechanics.filter(mechanic => 
        mechanic.rating >= minRating
      );
    }

    // Filter by experience
    if (experience) {
      filteredMechanics = filteredMechanics.filter(mechanic => {
        const exp = mechanic.experience || 0;
        if (experience === '0-2') return exp >= 0 && exp <= 2;
        if (experience === '3-5') return exp >= 3 && exp <= 5;
        if (experience === '6-10') return exp >= 6 && exp <= 10;
        if (experience === '10+') return exp >= 10;
        return true;
      });
    }

    // Filter by availability
    if (available === 'true') {
      filteredMechanics = filteredMechanics.filter(mechanic => mechanic.availability === true);
    } else if (available === 'false') {
      filteredMechanics = filteredMechanics.filter(mechanic => mechanic.availability === false);
    }

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      filteredMechanics = filteredMechanics.filter(mechanic => 
        (mechanic.name && mechanic.name.toLowerCase().includes(searchLower)) ||
        (mechanic.specialization && mechanic.specialization.toLowerCase().includes(searchLower)) ||
        (mechanic.email && mechanic.email.toLowerCase().includes(searchLower))
      );
    }

    // Remove duplicates based on email
    const uniqueMechanics = filteredMechanics.filter((mechanic, index, self) => 
      index === self.findIndex(m => m.email === mechanic.email)
    );

    const total = uniqueMechanics.length;

    res.json({
      mechanics: uniqueMechanics,
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

    console.log('🔍 Nearby mechanics request:', { lat, lng, maxDistance });
    console.log('🔍 Route handler called successfully');

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const coordinates = [parseFloat(lng), parseFloat(lat)];
    const radiusInKm = parseFloat(maxDistance);
    const radiusInRadians = radiusInKm / 6378.1; // Earth's radius in km

    console.log('Searching for mechanics within', radiusInKm, 'km of', coordinates);

    // Find mechanics with coordinates within the specified distance using $geoWithin
    const mechanics = await Mechanic.find({
      location: {
        $geoWithin: {
          $centerSphere: [coordinates, radiusInRadians]
        }
      }
    })
    .sort({ rating: -1 });

    // Also find users with mechanic role who have coordinates
    const usersWithMechanicRole = await User.find({
      role: 'mechanic',
      location: {
        $geoWithin: {
          $centerSphere: [coordinates, radiusInRadians]
        }
      }
    })
    .select('name email phone address role createdAt availability specialization rating experience');

    console.log('Found mechanics:', mechanics.length);
    console.log('Found users with mechanic role:', usersWithMechanicRole.length);

    // Combine both results
    const allMechanics = [
      ...usersWithMechanicRole.map(user => ({
        _id: user._id,
        userId: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone
        },
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        isUserMechanic: true,
        rating: user.rating || 0,
        totalReviews: user.totalReviews || 0,
        specialization: user.specialization || 'General Mechanic',
        experience: user.experience || 0,
        availability: user.availability !== undefined ? user.availability : true,
        services: user.services || [],
        pricing: user.pricing || { hourlyRate: 0 },
        coordinates: user.location?.coordinates
      })),
      ...mechanics.map(mechanic => ({
        ...mechanic.toObject(),
        isUserMechanic: false
      }))
    ];

    // Remove duplicates based on email
    const uniqueMechanics = allMechanics.filter((mechanic, index, self) => 
      index === self.findIndex(m => m.email === mechanic.email)
    );

    console.log('Total unique mechanics found:', uniqueMechanics.length);

    res.json({
      mechanics: uniqueMechanics,
      userLocation: { lat: parseFloat(lat), lng: parseFloat(lng) },
      maxDistance: parseFloat(maxDistance)
    });
  } catch (error) {
    console.error('Get nearby mechanics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/mechanics/profile
// @desc    Get mechanic profile
// @access  Private
router.get('/profile', [protect, authorize('mechanic')], async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user data with mechanic-specific fields
    const mechanicProfile = {
      _id: user._id,
      userId: user._id,
      specialization: user.specialization || 'General Mechanic',
      experience: user.experience || 0,
      rating: user.rating || 0,
      totalReviews: user.totalReviews || 0,
      services: user.services || ['General Maintenance'],
      pricing: user.pricing || { hourlyRate: 0 },
      availability: user.availability !== undefined ? user.availability : true,
      workingHours: user.workingHours || { start: '09:00', end: '18:00' },
      workingDays: user.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      address: user.address,
      contactInfo: {
        phone: user.phone,
        email: user.email
      }
    };

    res.json(mechanicProfile);
  } catch (error) {
    console.error('Get mechanic profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/mechanics/:id
// @desc    Get single mechanic by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    console.log('Looking for mechanic with ID:', req.params.id);
    
    // First try to find in Mechanic collection
    let mechanic = await Mechanic.findById(req.params.id)
      .populate('userId', 'name phone email')
      .populate('reviews.userId', 'name');

    console.log('Found in Mechanic collection:', mechanic ? 'Yes' : 'No');

    // If not found in Mechanic collection, try User collection
    if (!mechanic) {
      const user = await User.findById(req.params.id);
      console.log('Found in User collection:', user ? 'Yes' : 'No');
      
      if (user && user.role === 'mechanic') {
        // Create a mechanic-like object from user data
        mechanic = {
          _id: user._id,
          userId: {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone
          },
          specialization: user.specialization || 'General Mechanic',
          rating: user.rating || 0,
          totalReviews: user.totalReviews || 0,
          experience: user.experience || 0,
          location: user.address?.city || 'Location not specified',
          address: user.address,
          services: user.services || [],
          pricing: user.pricing || { hourlyRate: 0 },
          availability: user.availability || true,
          reviews: user.reviews || []
        };
      }
    }

    if (!mechanic) {
      // Let's also check what mechanics are available
      const allMechanics = await Mechanic.find({}).limit(5);
      const allUsers = await User.find({ role: 'mechanic' }).limit(5);
      console.log('Available mechanics:', allMechanics.map(m => ({ id: m._id, name: m.userId?.name })));
      console.log('Available users with mechanic role:', allUsers.map(u => ({ id: u._id, name: u.name })));
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

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    const allowedFields = ['specialization', 'experience', 'services', 'pricing', 'availability', 'workingHours', 'workingDays'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    // Return updated profile
    const updatedProfile = {
      _id: user._id,
      userId: user._id,
      specialization: user.specialization || 'General Mechanic',
      experience: user.experience || 0,
      rating: user.rating || 0,
      totalReviews: user.totalReviews || 0,
      services: user.services || ['General Maintenance'],
      pricing: user.pricing || { hourlyRate: 0 },
      availability: user.availability !== undefined ? user.availability : true,
      workingHours: user.workingHours || { start: '09:00', end: '18:00' },
      workingDays: user.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      address: user.address,
      contactInfo: {
        phone: user.phone,
        email: user.email
      }
    };

    res.json(updatedProfile);
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

    // Update user's availability since mechanics are stored as users
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { availability, workingHours, workingDays } = req.body;
    
    if (availability !== undefined) user.availability = availability;
    if (workingHours) user.workingHours = workingHours;
    if (workingDays) user.workingDays = workingDays;

    await user.save();

    res.json({ message: 'Availability updated successfully', user });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/mechanics/seed
// @desc    Seed sample mechanics data
// @access  Public (for development)
router.post('/seed', async (req, res) => {
  try {
    const { mechanics } = req.body;
    
    if (!mechanics || !Array.isArray(mechanics)) {
      return res.status(400).json({ message: 'Mechanics array is required' });
    }

    // Clear existing mechanics
    await Mechanic.deleteMany({});
    
    // Create sample mechanics
    const createdMechanics = await Mechanic.insertMany(mechanics);
    
    res.json({ 
      message: 'Mechanics seeded successfully', 
      count: createdMechanics.length,
      mechanics: createdMechanics 
    });
  } catch (error) {
    console.error('Seed mechanics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/mechanics/add-locations
// @desc    Add sample location data to existing mechanics
// @access  Public (for development)
router.post('/add-locations', async (req, res) => {
  try {
    // Sample locations in Mumbai area
    const sampleLocations = [
      { lat: 19.0760, lng: 72.8777 }, // Mumbai
      { lat: 19.2183, lng: 72.9781 }, // Thane
      { lat: 19.0330, lng: 73.0297 }, // Navi Mumbai
      { lat: 19.1077, lng: 72.8262 }, // Andheri
      { lat: 19.0176, lng: 72.8562 }, // Bandra
    ];

    // Update mechanics with sample locations
    const mechanics = await Mechanic.find({});
    for (let i = 0; i < mechanics.length && i < sampleLocations.length; i++) {
      const location = sampleLocations[i];
      mechanics[i].location = {
        type: 'Point',
        coordinates: [location.lng, location.lat]
      };
      await mechanics[i].save();
    }

    // Update users with mechanic role with sample locations
    const users = await User.find({ role: 'mechanic' });
    for (let i = 0; i < users.length && i < sampleLocations.length; i++) {
      const location = sampleLocations[i];
      users[i].location = {
        type: 'Point',
        coordinates: [location.lng, location.lat]
      };
      await users[i].save();
    }

    res.json({ 
      message: 'Location data added successfully',
      mechanicsUpdated: mechanics.length,
      usersUpdated: users.length
    });
  } catch (error) {
    console.error('Add locations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/mechanics/bookings/all
// @desc    Get mechanic bookings - all for admin, user's own for others
// @access  Private
router.get('/bookings/all', [protect], async (req, res) => {
  try {
    console.log('Fetching mechanic bookings for user:', req.user.role, req.user._id);
    
    const MechanicBooking = require('../models/MechanicBooking');
    let query = {};
    
    // If user is not admin, only show their own bookings
    if (req.user.role !== 'admin') {
      query.customerId = req.user._id;
    }
    
    const bookings = await MechanicBooking.find(query)
      .populate('customerId', 'name email phone')
      .populate('mechanicId', 'name email phone specialization')
      .sort({ createdAt: -1 });

    console.log('Found mechanic bookings:', bookings.length, 'for role:', req.user.role);

    res.json({
      bookings: bookings,
      total: bookings.length,
      userRole: req.user.role,
      isAdmin: req.user.role === 'admin'
    });
  } catch (error) {
    console.error('Get mechanic bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/mechanics/:id/reviews
// @desc    Add review to mechanic
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
