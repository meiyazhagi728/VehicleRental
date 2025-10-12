const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  siteName: {
    type: String,
    default: 'Vehicle Rental System',
    required: true
  },
  siteDescription: {
    type: String,
    default: 'Premium vehicle rental platform',
    required: true
  },
  contactEmail: {
    type: String,
    default: 'admin@vehiclerental.com',
    required: true
  },
  contactPhone: {
    type: String,
    default: '+91 98765 43210',
    required: true
  },
  notifications: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    smsNotifications: {
      type: Boolean,
      default: false
    },
    pushNotifications: {
      type: Boolean,
      default: true
    }
  },
  security: {
    requireEmailVerification: {
      type: Boolean,
      default: true
    },
    requirePhoneVerification: {
      type: Boolean,
      default: false
    },
    twoFactorAuth: {
      type: Boolean,
      default: false
    }
  },
  system: {
    maintenanceMode: {
      type: Boolean,
      default: false
    },
    allowRegistration: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

settingsSchema.statics.updateSettings = async function(updateData) {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create(updateData);
  } else {
    Object.assign(settings, updateData);
    await settings.save();
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
