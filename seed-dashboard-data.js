const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Vehicle = require('./models/Vehicle');
const Booking = require('./models/Booking');
const Mechanic = require('./models/Mechanic');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vehicle_rental', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample data for different roles
const sampleUsers = [
  // Admin users
  {
    name: 'Admin User',
    email: 'admin@vehicle.com',
    password: 'admin123',
    phone: 9876543210,
    role: 'admin',
    address: 'Admin Office, Chennai',
    location: {
      type: 'Point',
      coordinates: [80.2707, 13.0827] // Chennai coordinates
    },
    isActive: true,
    isApproved: true
  },
  {
    name: 'Super Admin',
    email: 'superadmin@vehicle.com',
    password: 'superadmin123',
    phone: 9876543211,
    role: 'admin',
    address: 'Head Office, Mumbai',
    location: {
      type: 'Point',
      coordinates: [72.8777, 19.0760] // Mumbai coordinates
    },
    isActive: true,
    isApproved: true
  },

  // Regular users/customers
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'user123',
    phone: 9876543212,
    role: 'user',
    address: '123 Main St, Bangalore',
    location: {
      type: 'Point',
      coordinates: [77.5946, 12.9716] // Bangalore coordinates
    },
    isActive: true,
    isApproved: true
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'user123',
    phone: 9876543213,
    role: 'user',
    address: '456 Park Ave, Delhi',
    location: {
      type: 'Point',
      coordinates: [77.1025, 28.7041] // Delhi coordinates
    },
    isActive: true,
    isApproved: true
  },
  {
    name: 'Mike Johnson',
    email: 'mike@example.com',
    password: 'user123',
    phone: 9876543214,
    role: 'user',
    address: '789 Oak St, Hyderabad',
    location: {
      type: 'Point',
      coordinates: [78.4867, 17.3850] // Hyderabad coordinates
    },
    isActive: true,
    isApproved: true
  },

  // Vendor users
  {
    name: 'Auto Rentals Co.',
    email: 'vendor1@autorentals.com',
    password: 'vendor123',
    phone: 9876543215,
    role: 'vendor',
    address: 'Auto Hub, Chennai',
    location: {
      type: 'Point',
      coordinates: [80.2707, 13.0827] // Chennai coordinates
    },
    isActive: true,
    isApproved: true
  },
  {
    name: 'Premium Cars Ltd.',
    email: 'vendor2@premiumcars.com',
    password: 'vendor123',
    phone: 9876543216,
    role: 'vendor',
    address: 'Car Center, Mumbai',
    location: {
      type: 'Point',
      coordinates: [72.8777, 19.0760] // Mumbai coordinates
    },
    isActive: true,
    isApproved: true
  },
  {
    name: 'City Wheels',
    email: 'vendor3@citywheels.com',
    password: 'vendor123',
    phone: 9876543217,
    role: 'vendor',
    address: 'Wheel Plaza, Bangalore',
    location: {
      type: 'Point',
      coordinates: [77.5946, 12.9716] // Bangalore coordinates
    },
    isActive: true,
    isApproved: true
  },

  // Mechanic users - All with password 'mechanic123'
  {
    name: 'Raj Kumar',
    email: 'raj@mechanic.com',
    password: 'mechanic123',
    phone: 9876543218,
    role: 'mechanic',
    address: 'Mechanic Street, Chennai',
    location: {
      type: 'Point',
      coordinates: [80.2707, 13.0827] // Chennai coordinates
    },
    isActive: true,
    isApproved: true
  },
  {
    name: 'Suresh Patel',
    email: 'suresh@mechanic.com',
    password: 'mechanic123',
    phone: 9876543219,
    role: 'mechanic',
    address: 'Service Lane, Mumbai',
    location: {
      type: 'Point',
      coordinates: [72.8777, 19.0760] // Mumbai coordinates
    },
    isActive: true,
    isApproved: true
  },
  {
    name: 'Kumar Singh',
    email: 'kumar@mechanic.com',
    password: 'mechanic123',
    phone: 9876543220,
    role: 'mechanic',
    address: 'Repair Center, Bangalore',
    location: {
      type: 'Point',
      coordinates: [77.5946, 12.9716] // Bangalore coordinates
    },
    isActive: true,
    isApproved: true
  },
  {
    name: 'Amit Sharma',
    email: 'amit@mechanic.com',
    password: 'mechanic123',
    phone: 9876543221,
    role: 'mechanic',
    address: 'Auto Service Center, Delhi',
    location: {
      type: 'Point',
      coordinates: [77.1025, 28.7041] // Delhi coordinates
    },
    isActive: true,
    isApproved: true
  },
  {
    name: 'Vikram Reddy',
    email: 'vikram@mechanic.com',
    password: 'mechanic123',
    phone: 9876543222,
    role: 'mechanic',
    address: 'Garage Lane, Hyderabad',
    location: {
      type: 'Point',
      coordinates: [78.4867, 17.3850] // Hyderabad coordinates
    },
    isActive: true,
    isApproved: true
  },
  {
    name: 'Manoj Kumar',
    email: 'manoj@mechanic.com',
    password: 'mechanic123',
    phone: 9876543223,
    role: 'mechanic',
    address: 'Service Road, Pune',
    location: {
      type: 'Point',
      coordinates: [73.8567, 18.5204] // Pune coordinates
    },
    isActive: true,
    isApproved: true
  },
  {
    name: 'Deepak Gupta',
    email: 'deepak@mechanic.com',
    password: 'mechanic123',
    phone: 9876543224,
    role: 'mechanic',
    address: 'Mechanic Colony, Kolkata',
    location: {
      type: 'Point',
      coordinates: [88.3639, 22.5726] // Kolkata coordinates
    },
    isActive: true,
    isApproved: true
  },
  {
    name: 'Ravi Verma',
    email: 'ravi@mechanic.com',
    password: 'mechanic123',
    phone: 9876543225,
    role: 'mechanic',
    address: 'Auto Hub, Ahmedabad',
    location: {
      type: 'Point',
      coordinates: [72.5714, 23.0225] // Ahmedabad coordinates
    },
    isActive: true,
    isApproved: true
  },
  {
    name: 'Sunil Joshi',
    email: 'sunil@mechanic.com',
    password: 'mechanic123',
    phone: 9876543226,
    role: 'mechanic',
    address: 'Service Center, Jaipur',
    location: {
      type: 'Point',
      coordinates: [75.7873, 26.9124] // Jaipur coordinates
    },
    isActive: true,
    isApproved: true
  },
  {
    name: 'Prakash Mehta',
    email: 'prakash@mechanic.com',
    password: 'mechanic123',
    phone: 9876543227,
    role: 'mechanic',
    address: 'Repair Shop, Surat',
    location: {
      type: 'Point',
      coordinates: [72.8311, 21.1702] // Surat coordinates
    },
    isActive: true,
    isApproved: true
  }
];

const sampleVehicles = [
  {
    name: 'Toyota Camry 2023',
    type: 'Car',
    fuelType: 'Petrol',
    brand: 'Toyota',
    model: 'Camry',
    year: 2023,
    description: 'Luxury sedan with premium features and excellent fuel efficiency.',
    pricePerDay: 2500,
    location: 'Chennai, Tamil Nadu',
    images: [
      'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop'
    ],
    coordinates: {
      type: 'Point',
      coordinates: [80.2707, 13.0827]
    },
    isAvailable: true,
    specifications: {
      seats: 5,
      transmission: 'Automatic',
      mileage: 15,
      engineCapacity: '2.5L',
      color: 'White',
      registrationNumber: 'TN01AB1234',
      insuranceExpiry: new Date('2024-12-31'),
      permitExpiry: new Date('2024-12-31')
    },
    features: ['AC', 'GPS', 'Bluetooth', 'Backup Camera', 'Cruise Control'],
    rating: 4.5,
    totalReviews: 25
  },
  {
    name: 'Honda City 2023',
    type: 'Car',
    fuelType: 'Petrol',
    brand: 'Honda',
    model: 'City',
    year: 2023,
    description: 'Compact sedan perfect for city driving with great comfort.',
    pricePerDay: 2000,
    location: 'Mumbai, Maharashtra',
    coordinates: {
      type: 'Point',
      coordinates: [72.8777, 19.0760]
    },
    images: [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1549317336-206569e8475c?w=800&h=600&fit=crop'
    ],
    isAvailable: true,
    specifications: {
      seats: 5,
      transmission: 'Manual',
      mileage: 17,
      engineCapacity: '1.5L',
      color: 'Silver',
      registrationNumber: 'MH01CD5678',
      insuranceExpiry: new Date('2024-11-30'),
      permitExpiry: new Date('2024-11-30')
    },
    features: ['AC', 'Bluetooth', 'Power Windows', 'Power Steering'],
    rating: 4.2,
    totalReviews: 18
  },
  {
    name: 'Maruti Swift 2023',
    type: 'Car',
    fuelType: 'Petrol',
    brand: 'Maruti',
    model: 'Swift',
    year: 2023,
    description: 'Popular hatchback with excellent fuel efficiency and low maintenance.',
    pricePerDay: 1500,
    location: 'Bangalore, Karnataka',
    coordinates: {
      type: 'Point',
      coordinates: [77.5946, 12.9716]
    },
    images: [
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop'
    ],
    isAvailable: true,
    specifications: {
      seats: 5,
      transmission: 'Manual',
      mileage: 20,
      engineCapacity: '1.2L',
      color: 'Red',
      registrationNumber: 'KA01EF9012',
      insuranceExpiry: new Date('2024-10-31'),
      permitExpiry: new Date('2024-10-31')
    },
    features: ['AC', 'Bluetooth', 'Power Windows'],
    rating: 4.0,
    totalReviews: 32
  },
  {
    name: 'BMW X5 2023',
    type: 'SUV',
    fuelType: 'Petrol',
    brand: 'BMW',
    model: 'X5',
    year: 2023,
    description: 'Luxury SUV with premium features and powerful performance.',
    pricePerDay: 8000,
    location: 'Delhi, NCR',
    coordinates: {
      type: 'Point',
      coordinates: [77.1025, 28.7041]
    },
    images: [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1549317336-206569e8475c?w=800&h=600&fit=crop'
    ],
    isAvailable: true,
    specifications: {
      seats: 7,
      transmission: 'Automatic',
      mileage: 12,
      engineCapacity: '3.0L',
      color: 'Black',
      registrationNumber: 'DL01GH3456',
      insuranceExpiry: new Date('2024-09-30'),
      permitExpiry: new Date('2024-09-30')
    },
    features: ['AC', 'GPS', 'Bluetooth', 'Backup Camera', 'Cruise Control', 'Parking Sensors', 'ABS', 'Airbags'],
    rating: 4.8,
    totalReviews: 15
  },
  {
    name: 'Royal Enfield Classic 350',
    type: 'Bike',
    fuelType: 'Petrol',
    brand: 'Royal Enfield',
    model: 'Classic 350',
    year: 2023,
    description: 'Classic cruiser bike with vintage appeal and powerful engine.',
    pricePerDay: 800,
    location: 'Hyderabad, Telangana',
    coordinates: {
      type: 'Point',
      coordinates: [78.4867, 17.3850]
    },
    images: [
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop'
    ],
    isAvailable: true,
    specifications: {
      seats: 2,
      transmission: 'Manual',
      mileage: 35,
      engineCapacity: '350cc',
      color: 'Black',
      registrationNumber: 'TS01IJ7890',
      insuranceExpiry: new Date('2024-08-31'),
      permitExpiry: new Date('2024-08-31')
    },
    features: ['ABS'],
    rating: 4.3,
    totalReviews: 28
  }
];

const sampleBookings = [
  {
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), // 9 days from now
    totalDays: 2,
    totalAmount: 5000,
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'card',
    paymentId: 'pay_123456789',
    paymentAmount: 5000,
    transactionId: 'txn_123456789',
    paymentDate: new Date('2024-01-10'),
    pickupLocation: 'Chennai Airport',
    dropLocation: 'Chennai Central',
    pickupCoordinates: {
      type: 'Point',
      coordinates: [80.1691, 12.9941]
    },
    dropCoordinates: {
      type: 'Point',
      coordinates: [80.2707, 13.0827]
    },
    driverDetails: {
      name: 'John Doe',
      licenseNumber: 'DL123456789',
      phone: '9876543212'
    },
    additionalServices: [
      { service: 'GPS', price: 200 },
      { service: 'Insurance', price: 300 }
    ],
    notes: 'Please ensure the car is clean and has a full tank of fuel.'
  },
  {
    startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    endDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
    totalDays: 2,
    totalAmount: 4000,
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethod: 'upi',
    pickupLocation: 'Mumbai Central',
    dropLocation: 'Mumbai Airport',
    pickupCoordinates: {
      type: 'Point',
      coordinates: [72.8777, 19.0760]
    },
    dropCoordinates: {
      type: 'Point',
      coordinates: [72.8777, 19.0760]
    },
    driverDetails: {
      name: 'Jane Smith',
      licenseNumber: 'MH987654321',
      phone: '9876543213'
    },
    additionalServices: [
      { service: 'Child Seat', price: 150 }
    ],
    notes: 'Need a child seat for 2-year-old.'
  },
  {
    startDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    endDate: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000), // 17 days from now
    totalDays: 2,
    totalAmount: 3000,
    status: 'completed',
    paymentStatus: 'paid',
    paymentMethod: 'netbanking',
    paymentId: 'pay_987654321',
    paymentAmount: 3000,
    transactionId: 'txn_987654321',
    paymentDate: new Date('2024-01-20'),
    pickupLocation: 'Bangalore City Center',
    dropLocation: 'Bangalore Airport',
    pickupCoordinates: {
      type: 'Point',
      coordinates: [77.5946, 12.9716]
    },
    dropCoordinates: {
      type: 'Point',
      coordinates: [77.5946, 12.9716]
    },
    driverDetails: {
      name: 'Mike Johnson',
      licenseNumber: 'KA456789123',
      phone: '9876543214'
    },
    additionalServices: [],
    notes: 'Smooth ride, excellent service.'
  }
];

const sampleMechanics = [
  {
    services: ['Engine Repair', 'Brake Service', 'Oil Change', 'General Maintenance'],
    specialization: 'Engine Specialist',
    experience: 8,
    rating: 4.5,
    totalReviews: 45,
    availability: true,
    workingHours: {
      start: '08:00',
      end: '18:00'
    },
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    location: {
      type: 'Point',
      coordinates: [80.2707, 13.0827]
    },
    serviceArea: 15,
    address: {
      street: '123 Mechanic Street',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600001'
    },
    contactInfo: {
      phone: '9876543218',
      whatsapp: '9876543218',
      email: 'raj@mechanic.com'
    },
    documents: {
      license: 'MECH123456',
      certifications: ['ASE Certified', 'Engine Specialist'],
      insurance: 'INS123456'
    },
    pricing: {
      consultationFee: 200,
      hourlyRate: 500,
      emergencyFee: 1000
    },
    emergencyService: true,
    emergencyContact: '9876543218',
    languages: ['English', 'Tamil', 'Hindi'],
    isVerified: true,
    isActive: true
  },
  {
    services: ['AC Service', 'Electrical Repair', 'Battery Service', 'General Maintenance'],
    specialization: 'AC & Electrical Expert',
    experience: 6,
    rating: 4.2,
    totalReviews: 32,
    availability: true,
    workingHours: {
      start: '09:00',
      end: '19:00'
    },
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    location: {
      type: 'Point',
      coordinates: [72.8777, 19.0760]
    },
    serviceArea: 12,
    address: {
      street: '456 Service Lane',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001'
    },
    contactInfo: {
      phone: '9876543219',
      whatsapp: '9876543219',
      email: 'suresh@mechanic.com'
    },
    documents: {
      license: 'MECH789012',
      certifications: ['AC Specialist', 'Electrical Expert'],
      insurance: 'INS789012'
    },
    pricing: {
      consultationFee: 150,
      hourlyRate: 400,
      emergencyFee: 800
    },
    emergencyService: true,
    emergencyContact: '9876543219',
    languages: ['English', 'Hindi', 'Telugu'],
    isVerified: true,
    isActive: true
  },
  {
    services: ['Tire Service', 'Body Repair', 'Paint Job', 'General Maintenance'],
    specialization: 'Body & Paint Expert',
    experience: 10,
    rating: 4.7,
    totalReviews: 58,
    availability: true,
    workingHours: {
      start: '07:00',
      end: '17:00'
    },
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    location: {
      type: 'Point',
      coordinates: [77.5946, 12.9716]
    },
    serviceArea: 20,
    address: {
      street: '789 Repair Center',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001'
    },
    contactInfo: {
      phone: '9876543220',
      whatsapp: '9876543220',
      email: 'kumar@mechanic.com'
    },
    documents: {
      license: 'MECH345678',
      certifications: ['Body Repair Specialist', 'Paint Expert'],
      insurance: 'INS345678'
    },
    pricing: {
      consultationFee: 300,
      hourlyRate: 600,
      emergencyFee: 1200
    },
    emergencyService: true,
    emergencyContact: '9876543220',
    languages: ['English', 'Kannada', 'Hindi'],
    isVerified: true,
    isActive: true
  },
  {
    services: ['Engine Repair', 'Brake Service', 'Oil Change', 'General Maintenance'],
    specialization: 'Transmission Expert',
    experience: 7,
    rating: 4.3,
    totalReviews: 38,
    availability: true,
    workingHours: {
      start: '08:30',
      end: '18:30'
    },
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    location: {
      type: 'Point',
      coordinates: [77.1025, 28.7041]
    },
    serviceArea: 18,
    address: {
      street: 'Auto Service Center',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001'
    },
    contactInfo: {
      phone: '9876543221',
      whatsapp: '9876543221',
      email: 'amit@mechanic.com'
    },
    documents: {
      license: 'MECH456789',
      certifications: ['Transmission Specialist', 'Engine Expert'],
      insurance: 'INS456789'
    },
    pricing: {
      consultationFee: 250,
      hourlyRate: 550,
      emergencyFee: 1100
    },
    emergencyService: true,
    emergencyContact: '9876543221',
    languages: ['English', 'Hindi', 'Telugu'],
    isVerified: true,
    isActive: true
  },
  {
    services: ['AC Service', 'Electrical Repair', 'Battery Service', 'General Maintenance'],
    specialization: 'HVAC Specialist',
    experience: 5,
    rating: 4.1,
    totalReviews: 28,
    availability: true,
    workingHours: {
      start: '09:00',
      end: '18:00'
    },
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    location: {
      type: 'Point',
      coordinates: [78.4867, 17.3850]
    },
    serviceArea: 14,
    address: {
      street: 'Garage Lane',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500001'
    },
    contactInfo: {
      phone: '9876543222',
      whatsapp: '9876543222',
      email: 'vikram@mechanic.com'
    },
    documents: {
      license: 'MECH567890',
      certifications: ['HVAC Specialist', 'Cooling Expert'],
      insurance: 'INS567890'
    },
    pricing: {
      consultationFee: 180,
      hourlyRate: 450,
      emergencyFee: 900
    },
    emergencyService: true,
    emergencyContact: '9876543222',
    languages: ['English', 'Telugu', 'Hindi'],
    isVerified: true,
    isActive: true
  },
  {
    services: ['Brake Service', 'Engine Repair', 'Oil Change', 'General Maintenance'],
    specialization: 'Brake & Clutch Expert',
    experience: 9,
    rating: 4.6,
    totalReviews: 42,
    availability: true,
    workingHours: {
      start: '08:00',
      end: '17:30'
    },
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    location: {
      type: 'Point',
      coordinates: [73.8567, 18.5204]
    },
    serviceArea: 16,
    address: {
      street: 'Service Road',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001'
    },
    contactInfo: {
      phone: '9876543223',
      whatsapp: '9876543223',
      email: 'manoj@mechanic.com'
    },
    documents: {
      license: 'MECH678901',
      certifications: ['Brake Specialist', 'Clutch Expert'],
      insurance: 'INS678901'
    },
    pricing: {
      consultationFee: 220,
      hourlyRate: 520,
      emergencyFee: 1050
    },
    emergencyService: true,
    emergencyContact: '9876543223',
    languages: ['English', 'Hindi', 'Telugu'],
    isVerified: true,
    isActive: true
  },
  {
    services: ['Engine Repair', 'Brake Service', 'Oil Change', 'General Maintenance'],
    specialization: 'Performance Expert',
    experience: 12,
    rating: 4.8,
    totalReviews: 65,
    availability: true,
    workingHours: {
      start: '07:30',
      end: '19:00'
    },
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    location: {
      type: 'Point',
      coordinates: [88.3639, 22.5726]
    },
    serviceArea: 22,
    address: {
      street: 'Mechanic Colony',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700001'
    },
    contactInfo: {
      phone: '9876543224',
      whatsapp: '9876543224',
      email: 'deepak@mechanic.com'
    },
    documents: {
      license: 'MECH789012',
      certifications: ['Performance Specialist', 'Turbo Expert'],
      insurance: 'INS789012'
    },
    pricing: {
      consultationFee: 350,
      hourlyRate: 700,
      emergencyFee: 1400
    },
    emergencyService: true,
    emergencyContact: '9876543224',
    languages: ['English', 'Hindi', 'Telugu'],
    isVerified: true,
    isActive: true
  },
  {
    services: ['Electrical Repair', 'Battery Service', 'AC Service', 'General Maintenance'],
    specialization: 'Electronics Expert',
    experience: 6,
    rating: 4.4,
    totalReviews: 35,
    availability: true,
    workingHours: {
      start: '09:00',
      end: '18:00'
    },
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    location: {
      type: 'Point',
      coordinates: [72.5714, 23.0225]
    },
    serviceArea: 13,
    address: {
      street: 'Auto Hub',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380001'
    },
    contactInfo: {
      phone: '9876543225',
      whatsapp: '9876543225',
      email: 'ravi@mechanic.com'
    },
    documents: {
      license: 'MECH890123',
      certifications: ['Electronics Specialist', 'ECU Expert'],
      insurance: 'INS890123'
    },
    pricing: {
      consultationFee: 200,
      hourlyRate: 480,
      emergencyFee: 960
    },
    emergencyService: true,
    emergencyContact: '9876543225',
    languages: ['English', 'Hindi', 'Telugu'],
    isVerified: true,
    isActive: true
  },
  {
    services: ['Engine Repair', 'Oil Change', 'Brake Service', 'General Maintenance'],
    specialization: 'Diesel Expert',
    experience: 8,
    rating: 4.2,
    totalReviews: 40,
    availability: true,
    workingHours: {
      start: '08:00',
      end: '18:00'
    },
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    location: {
      type: 'Point',
      coordinates: [75.7873, 26.9124]
    },
    serviceArea: 17,
    address: {
      street: 'Service Center',
      city: 'Jaipur',
      state: 'Rajasthan',
      pincode: '302001'
    },
    contactInfo: {
      phone: '9876543226',
      whatsapp: '9876543226',
      email: 'sunil@mechanic.com'
    },
    documents: {
      license: 'MECH901234',
      certifications: ['Diesel Specialist', 'Fuel Expert'],
      insurance: 'INS901234'
    },
    pricing: {
      consultationFee: 230,
      hourlyRate: 500,
      emergencyFee: 1000
    },
    emergencyService: true,
    emergencyContact: '9876543226',
    languages: ['English', 'Hindi', 'Telugu'],
    isVerified: true,
    isActive: true
  },
  {
    services: ['Engine Repair', 'Brake Service', 'Oil Change', 'General Maintenance'],
    specialization: 'Two Wheeler Expert',
    experience: 4,
    rating: 4.0,
    totalReviews: 25,
    availability: true,
    workingHours: {
      start: '09:30',
      end: '18:30'
    },
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    location: {
      type: 'Point',
      coordinates: [72.8311, 21.1702]
    },
    serviceArea: 11,
    address: {
      street: 'Repair Shop',
      city: 'Surat',
      state: 'Gujarat',
      pincode: '395001'
    },
    contactInfo: {
      phone: '9876543227',
      whatsapp: '9876543227',
      email: 'prakash@mechanic.com'
    },
    documents: {
      license: 'MECH012345',
      certifications: ['Two Wheeler Specialist', 'Bike Expert'],
      insurance: 'INS012345'
    },
    pricing: {
      consultationFee: 150,
      hourlyRate: 350,
      emergencyFee: 700
    },
    emergencyService: true,
    emergencyContact: '9876543227',
    languages: ['English', 'Hindi', 'Telugu'],
    isVerified: true,
    isActive: true
  }
];

// Hash passwords
const hashPasswords = async (users) => {
  for (let user of users) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  return users;
};

// Seed data function
const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    console.log('🗑️ Clearing existing data...');
    await User.deleteMany({});
    await Vehicle.deleteMany({});
    await Booking.deleteMany({});
    await Mechanic.deleteMany({});

    // Hash passwords
    console.log('🔐 Hashing passwords...');
    const hashedUsers = await hashPasswords(sampleUsers);

    // Create users
    console.log('👥 Creating users...');
    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Create vehicles with vendor references
    console.log('🚗 Creating vehicles...');
    const vendors = createdUsers.filter(user => user.role === 'vendor');
    const vehiclesWithVendors = sampleVehicles.map((vehicle, index) => ({
      ...vehicle,
      vendorId: vendors[index % vendors.length]._id
    }));
    const createdVehicles = await Vehicle.insertMany(vehiclesWithVendors);
    console.log(`✅ Created ${createdVehicles.length} vehicles`);

    // Create mechanics with user references
    console.log('🔧 Creating mechanics...');
    const mechanicUsers = createdUsers.filter(user => user.role === 'mechanic');
    const mechanicsWithUsers = sampleMechanics.map((mechanic, index) => ({
      ...mechanic,
      userId: mechanicUsers[index]._id
    }));
    const createdMechanics = await Mechanic.insertMany(mechanicsWithUsers);
    console.log(`✅ Created ${createdMechanics.length} mechanics`);

    // Create bookings with user, vehicle, and vendor references
    console.log('📅 Creating bookings...');
    const customers = createdUsers.filter(user => user.role === 'user');
    const bookingsWithReferences = sampleBookings.map((booking, index) => ({
      ...booking,
      userId: customers[index % customers.length]._id,
      vehicleId: createdVehicles[index % createdVehicles.length]._id,
      vendorId: createdVehicles[index % createdVehicles.length].vendorId
    }));
    const createdBookings = await Booking.insertMany(bookingsWithReferences);
    console.log(`✅ Created ${createdBookings.length} bookings`);

    // Create additional sample data for dashboards
    console.log('📊 Creating additional dashboard data...');
    
    // Create more bookings for different statuses
    const additionalBookings = [];
    const statuses = ['pending', 'confirmed', 'active', 'completed', 'cancelled'];
    const paymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
    
    for (let i = 0; i < 20; i++) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30));
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 7) + 1);
      
      const vehicle = createdVehicles[Math.floor(Math.random() * createdVehicles.length)];
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      
      additionalBookings.push({
        userId: customer._id,
        vehicleId: vehicle._id,
        vendorId: vehicle.vendorId,
        startDate,
        endDate,
        totalDays,
        totalAmount: vehicle.pricePerDay * totalDays,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        paymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
        paymentMethod: ['card', 'upi', 'netbanking', 'cash'][Math.floor(Math.random() * 4)],
        pickupLocation: `${['Chennai', 'Mumbai', 'Bangalore', 'Delhi', 'Hyderabad'][Math.floor(Math.random() * 5)]} Airport`,
        dropLocation: `${['Chennai', 'Mumbai', 'Bangalore', 'Delhi', 'Hyderabad'][Math.floor(Math.random() * 5)]} Central`,
        driverDetails: {
          name: customer.name,
          licenseNumber: `DL${Math.floor(Math.random() * 1000000000)}`,
          phone: customer.phone.toString()
        },
        additionalServices: [],
        notes: `Booking ${i + 1} - Sample booking data`
      });
    }
    
    await Booking.insertMany(additionalBookings);
    console.log(`✅ Created ${additionalBookings.length} additional bookings`);

    // Create reviews for vehicles and mechanics
    console.log('⭐ Creating reviews...');
    for (const vehicle of createdVehicles) {
      const reviews = [];
      for (let i = 0; i < Math.floor(Math.random() * 10) + 5; i++) {
        reviews.push({
          userId: customers[Math.floor(Math.random() * customers.length)]._id,
          rating: Math.floor(Math.random() * 5) + 1,
          comment: `Great vehicle! ${['Excellent service', 'Good condition', 'Smooth ride', 'Comfortable', 'Reliable'][Math.floor(Math.random() * 5)]}`,
          date: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000)
        });
      }
      vehicle.reviews = reviews;
      await vehicle.save();
    }

    for (const mechanic of createdMechanics) {
      const reviews = [];
      for (let i = 0; i < Math.floor(Math.random() * 15) + 10; i++) {
        reviews.push({
          userId: customers[Math.floor(Math.random() * customers.length)]._id,
          rating: Math.floor(Math.random() * 5) + 1,
          comment: `Professional service! ${['Expert work', 'Quick service', 'Fair pricing', 'Friendly', 'Reliable'][Math.floor(Math.random() * 5)]}`,
          date: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000)
        });
      }
      mechanic.reviews = reviews;
      await mechanic.save();
    }

    console.log('✅ Created reviews for vehicles and mechanics');

    // Summary
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`👥 Users: ${createdUsers.length}`);
    console.log(`🚗 Vehicles: ${createdVehicles.length}`);
    console.log(`🔧 Mechanics: ${createdMechanics.length}`);
    console.log(`📅 Bookings: ${createdBookings.length + additionalBookings.length}`);
    
    console.log('\n🔑 Test Credentials:');
    console.log('Admin: admin@vehicle.com / admin123');
    console.log('Vendor: vendor1@autorentals.com / vendor123');
    console.log('Mechanic: raj@mechanic.com / mechanic123');
    console.log('Customer: john@example.com / user123');

  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run seeding
connectDB().then(() => {
  seedData();
});
