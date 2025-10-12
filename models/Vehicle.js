const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Vehicle name is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Vehicle type is required'],
    enum: ['Car', 'Bike', 'SUV', 'Van', 'Truck', 'Bus', 'Auto']
  },
  fuelType: {
    type: String,
    required: [true, 'Fuel type is required'],
    enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG']
  },
  brand: {
    type: String,
    required: [true, 'Brand is required']
  },
  model: {
    type: String,
    required: [true, 'Model is required']
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  pricePerDay: {
    type: Number,
    required: [true, 'Price per day is required'],
    min: [0, 'Price cannot be negative']
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  images: [{
    type: String,
    required: [true, 'At least one image is required']
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  specifications: {
    seats: {
      type: Number,
      required: [true, 'Number of seats is required'],
      min: [1, 'Vehicle must have at least 1 seat']
    },
    transmission: {
      type: String,
      enum: ['Manual', 'Automatic'],
      required: [true, 'Transmission type is required']
    },
    mileage: {
      type: Number,
      required: [true, 'Mileage is required'],
      min: [0, 'Mileage cannot be negative']
    },
    engineCapacity: {
      type: String,
      required: [true, 'Engine capacity is required']
    },
    color: {
      type: String,
      required: [true, 'Color is required']
    },
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true
    },
    insuranceExpiry: {
      type: Date,
      required: [true, 'Insurance expiry date is required']
    },
    permitExpiry: {
      type: Date,
      required: [true, 'Permit expiry date is required']
    }
  },
  features: [{
    type: String,
    enum: ['AC', 'GPS', 'Bluetooth', 'USB Charger', 'Backup Camera', 'Parking Sensors', 'Cruise Control', 'Power Windows', 'Power Steering', 'ABS', 'Airbags']
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  reviews: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: 500
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for geospatial queries
vehicleSchema.index({ coordinates: '2dsphere' });

// Index for search queries
vehicleSchema.index({ name: 'text', description: 'text', location: 'text' });

// Performance indexes for common queries
vehicleSchema.index({ type: 1, isAvailable: 1, createdAt: -1 });
vehicleSchema.index({ fuelType: 1, isAvailable: 1 });
vehicleSchema.index({ pricePerDay: 1, isAvailable: 1 });
vehicleSchema.index({ 'location.city': 1, isAvailable: 1 });
vehicleSchema.index({ vendorId: 1, isAvailable: 1 });
vehicleSchema.index({ make: 1, model: 1 });
vehicleSchema.index({ isAvailable: 1, createdAt: -1 });

// Calculate and persist average rating and total reviews
vehicleSchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.totalReviews = 0;
  } else {
    const totalRating = this.reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
    this.totalReviews = this.reviews.length;
    this.rating = this.totalReviews ? totalRating / this.totalReviews : 0;
  }
  return this.save();
};

module.exports = mongoose.model('Vehicle', vehicleSchema);
