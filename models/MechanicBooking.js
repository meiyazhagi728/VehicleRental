const mongoose = require('mongoose');

const mechanicBookingSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer ID is required']
  },
  mechanicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Mechanic ID is required']
  },
  serviceType: {
    type: String,
    required: [true, 'Service type is required'],
    enum: [
      'Engine Repair',
      'Brake Service',
      'Oil Change',
      'Tire Replacement',
      'Battery Service',
      'AC Repair',
      'Transmission Service',
      'Electrical Repair',
      'General Maintenance',
      'Other'
    ]
  },
  description: {
    type: String,
    required: [true, 'Problem description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  preferredDate: {
    type: Date,
    required: [true, 'Preferred date is required']
  },
  preferredTime: {
    type: String,
    required: false
  },
  location: {
    type: String,
    required: [true, 'Service location is required'],
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  contactPhone: {
    type: String,
    required: [true, 'Contact phone is required']
  },
  estimatedDuration: {
    type: String,
    default: '1 hour',
    enum: ['30 minutes', '1 hour', '2 hours', '3 hours', '4+ hours']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  actualStartTime: {
    type: Date,
    required: false
  },
  actualEndTime: {
    type: Date,
    required: false
  },
  totalCost: {
    type: Number,
    required: false,
    min: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: false
  },
  review: {
    type: String,
    maxlength: [300, 'Review cannot exceed 300 characters']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
mechanicBookingSchema.index({ customerId: 1, status: 1 });
mechanicBookingSchema.index({ mechanicId: 1, status: 1 });
mechanicBookingSchema.index({ preferredDate: 1 });
mechanicBookingSchema.index({ status: 1 });

// Virtual for formatted preferred date
mechanicBookingSchema.virtual('formattedDate').get(function() {
  return this.preferredDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for duration in hours
mechanicBookingSchema.virtual('durationInHours').get(function() {
  const durationMap = {
    '30 minutes': 0.5,
    '1 hour': 1,
    '2 hours': 2,
    '3 hours': 3,
    '4+ hours': 4
  };
  return durationMap[this.estimatedDuration] || 1;
});

// Static method to get bookings by mechanic
mechanicBookingSchema.statics.getByMechanic = function(mechanicId, status = null, hasReview = false) {
  const query = { mechanicId };
  
  if (status) {
    // Support multiple statuses separated by comma
    if (status.includes(',')) {
      query.status = { $in: status.split(',').map(s => s.trim()) };
    } else {
      query.status = status;
    }
  }
  
  if (hasReview) {
    query.rating = { $exists: true, $ne: null };
    query.review = { $exists: true, $ne: null, $ne: '' };
  }
  
  return this.find(query)
    .populate('customerId', 'name email phone')
    .sort({ preferredDate: 1 });
};

// Static method to get bookings by customer
mechanicBookingSchema.statics.getByCustomer = function(customerId, status = null) {
  const query = { customerId };
  if (status) {
    query.status = status;
  }
  return this.find(query)
    .populate('mechanicId', 'name email phone specialization')
    .sort({ preferredDate: -1 });
};

// Instance method to calculate total cost
mechanicBookingSchema.methods.calculateCost = function(mechanic) {
  const hourlyRate = mechanic.pricing?.hourlyRate || 0;
  const duration = this.durationInHours;
  return hourlyRate * duration;
};

// Pre-save middleware to validate dates
mechanicBookingSchema.pre('save', function(next) {
  if (this.preferredDate < new Date()) {
    return next(new Error('Preferred date cannot be in the past'));
  }
  next();
});

module.exports = mongoose.model('MechanicBooking', mechanicBookingSchema);
