const mongoose = require('mongoose');

const mechanicSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  services: [{
    type: String,
    enum: ['Engine Repair', 'Brake Service', 'Oil Change', 'Tire Service', 'Battery Service', 'AC Service', 'Electrical Repair', 'Body Repair', 'Paint Job', 'General Maintenance']
  }],
  specialization: {
    type: String,
    required: [true, 'Specialization is required']
  },
  experience: {
    type: Number,
    required: [true, 'Experience in years is required'],
    min: [0, 'Experience cannot be negative']
  },
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
  availability: {
    type: Boolean,
    default: true
  },
  workingHours: {
    start: {
      type: String,
      default: '09:00'
    },
    end: {
      type: String,
      default: '18:00'
    }
  },
  workingDays: [{
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  }],
  location: {
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
  serviceArea: {
    type: Number,
    default: 10, // in kilometers
    min: [1, 'Service area must be at least 1 km']
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required']
    }
  },
  contactInfo: {
    phone: {
      type: String,
      required: [true, 'Phone number is required']
    },
    whatsapp: {
      type: String
    },
    email: {
      type: String,
      required: [true, 'Email is required']
    }
  },
  documents: {
    license: {
      type: String,
      required: [true, 'Mechanic license is required']
    },
    certifications: [{
      type: String
    }],
    insurance: {
      type: String
    }
  },
  pricing: {
    consultationFee: {
      type: Number,
      default: 0
    },
    hourlyRate: {
      type: Number,
      required: [true, 'Hourly rate is required'],
      min: [0, 'Hourly rate cannot be negative']
    },
    emergencyFee: {
      type: Number,
      default: 0
    }
  },
  emergencyService: {
    type: Boolean,
    default: false
  },
  emergencyContact: {
    type: String
  },
  languages: [{
    type: String,
    enum: ['English', 'Tamil', 'Hindi', 'Telugu', 'Malayalam', 'Kannada']
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
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
mechanicSchema.index({ location: '2dsphere' });

// Index for search queries
mechanicSchema.index({ specialization: 'text', 'address.city': 'text', 'address.state': 'text' });

// Calculate average rating
mechanicSchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.totalReviews = 0;
  } else {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.rating = totalRating / this.reviews.length;
    this.totalReviews = this.reviews.length;
  }
  return this.save();
};

// Check if mechanic is available
mechanicSchema.methods.isAvailableNow = function() {
  if (!this.availability) return false;
  
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
  const currentTime = now.toTimeString().slice(0, 5);
  
  return this.workingDays.includes(currentDay) && 
         currentTime >= this.workingHours.start && 
         currentTime <= this.workingHours.end;
};

// Get nearby mechanics
mechanicSchema.statics.findNearby = function(coordinates, maxDistance = 10) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: maxDistance * 1000 // Convert km to meters
      }
    },
    isActive: true,
    availability: true
  }).populate('userId', 'name phone email');
};

module.exports = mongoose.model('Mechanic', mechanicSchema);
