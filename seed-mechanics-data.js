const mongoose = require('mongoose');
const Mechanic = require('./models/Mechanic');
const User = require('./models/User');

// Your location: 11.4946, 77.2792 (Erode, Tamil Nadu)
const userLocation = {
  latitude: 11.4946,
  longitude: 77.2792
};

// Function to generate coordinates within 50km radius
function generateCoordinatesWithinRadius(centerLat, centerLng, maxRadiusKm) {
  // Convert km to degrees (approximate)
  const kmPerDegree = 111.32;
  const maxRadiusDegrees = maxRadiusKm / kmPerDegree;
  
  // Generate random angle and distance
  const angle = Math.random() * 2 * Math.PI;
  const distance = Math.random() * maxRadiusDegrees;
  
  // Calculate new coordinates
  const newLat = centerLat + (distance * Math.cos(angle));
  const newLng = centerLng + (distance * Math.sin(angle));
  
  return [newLng, newLat]; // [longitude, latitude] for MongoDB
}

// Sample mechanics data within 50km of Erode
const sampleMechanics = [
  {
    specialization: 'Engine Repair Specialist',
    experience: 12,
    services: ['Engine Repair', 'Oil Change', 'Brake Service', 'General Maintenance'],
    rating: 4.8,
    totalReviews: 67,
    availability: true,
    workingHours: {
      start: '08:00',
      end: '19:00'
    },
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    location: {
      type: 'Point',
      coordinates: generateCoordinatesWithinRadius(userLocation.latitude, userLocation.longitude, 15)
    },
    serviceArea: 25,
    address: {
      street: '123 Auto Service Road',
      city: 'Erode',
      state: 'Tamil Nadu',
      pincode: '638001'
    },
    contactInfo: {
      phone: '9876543210',
      whatsapp: '9876543210',
      email: 'rajesh.engine@mechanic.com'
    },
    documents: {
      license: 'MECH001234',
      certifications: ['ASE Certified', 'Engine Specialist', 'Advanced Diagnostics'],
      insurance: 'INS001234'
    },
    pricing: {
      consultationFee: 300,
      hourlyRate: 600,
      emergencyFee: 1200
    },
    emergencyService: true,
    emergencyContact: '9876543210',
    languages: ['English', 'Tamil', 'Hindi'],
    isVerified: true,
    isActive: true
  },
  {
    specialization: 'AC & Electrical Expert',
    experience: 8,
    services: ['AC Service', 'Electrical Repair', 'Battery Service', 'General Maintenance'],
    rating: 4.6,
    totalReviews: 43,
    availability: true,
    workingHours: {
      start: '09:00',
      end: '18:00'
    },
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    location: {
      type: 'Point',
      coordinates: generateCoordinatesWithinRadius(userLocation.latitude, userLocation.longitude, 20)
    },
    serviceArea: 30,
    address: {
      street: '456 Cool Air Street',
      city: 'Erode',
      state: 'Tamil Nadu',
      pincode: '638002'
    },
    contactInfo: {
      phone: '9876543211',
      whatsapp: '9876543211',
      email: 'kumar.ac@mechanic.com'
    },
    documents: {
      license: 'MECH001235',
      certifications: ['AC Specialist', 'Electrical Engineer', 'HVAC Certified'],
      insurance: 'INS001235'
    },
    pricing: {
      consultationFee: 250,
      hourlyRate: 500,
      emergencyFee: 1000
    },
    emergencyService: true,
    emergencyContact: '9876543211',
    languages: ['English', 'Tamil'],
    isVerified: true,
    isActive: true
  },
  {
    specialization: 'Brake & Suspension Expert',
    experience: 10,
    services: ['Brake Service', 'Tire Service', 'General Maintenance'],
    rating: 4.7,
    totalReviews: 52,
    availability: true,
    workingHours: {
      start: '08:30',
      end: '18:30'
    },
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    location: {
      type: 'Point',
      coordinates: generateCoordinatesWithinRadius(userLocation.latitude, userLocation.longitude, 25)
    },
    serviceArea: 35,
    address: {
      street: '789 Brake Lane',
      city: 'Erode',
      state: 'Tamil Nadu',
      pincode: '638003'
    },
    contactInfo: {
      phone: '9876543212',
      whatsapp: '9876543212',
      email: 'suresh.brake@mechanic.com'
    },
    documents: {
      license: 'MECH001236',
      certifications: ['Brake Specialist', 'Suspension Expert', 'Safety Certified'],
      insurance: 'INS001236'
    },
    pricing: {
      consultationFee: 200,
      hourlyRate: 550,
      emergencyFee: 1100
    },
    emergencyService: true,
    emergencyContact: '9876543212',
    languages: ['English', 'Tamil', 'Telugu'],
    isVerified: true,
    isActive: true
  },
  {
    specialization: 'Body & Paint Specialist',
    experience: 15,
    services: ['Body Repair', 'Paint Job', 'General Maintenance'],
    rating: 4.9,
    totalReviews: 89,
    availability: true,
    workingHours: {
      start: '09:00',
      end: '17:00'
    },
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    location: {
      type: 'Point',
      coordinates: generateCoordinatesWithinRadius(userLocation.latitude, userLocation.longitude, 30)
    },
    serviceArea: 40,
    address: {
      street: '321 Paint Street',
      city: 'Erode',
      state: 'Tamil Nadu',
      pincode: '638004'
    },
    contactInfo: {
      phone: '9876543213',
      whatsapp: '9876543213',
      email: 'murugan.body@mechanic.com'
    },
    documents: {
      license: 'MECH001237',
      certifications: ['Body Repair Specialist', 'Paint Expert', 'Color Matching'],
      insurance: 'INS001237'
    },
    pricing: {
      consultationFee: 400,
      hourlyRate: 700,
      emergencyFee: 1500
    },
    emergencyService: false,
    emergencyContact: '9876543213',
    languages: ['English', 'Tamil'],
    isVerified: true,
    isActive: true
  },
  {
    specialization: 'General Auto Mechanic',
    experience: 6,
    services: ['General Maintenance', 'Oil Change', 'Battery Service', 'Tire Service'],
    rating: 4.4,
    totalReviews: 28,
    availability: true,
    workingHours: {
      start: '08:00',
      end: '18:00'
    },
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    location: {
      type: 'Point',
      coordinates: generateCoordinatesWithinRadius(userLocation.latitude, userLocation.longitude, 35)
    },
    serviceArea: 45,
    address: {
      street: '654 General Service Road',
      city: 'Erode',
      state: 'Tamil Nadu',
      pincode: '638005'
    },
    contactInfo: {
      phone: '9876543214',
      whatsapp: '9876543214',
      email: 'ramesh.general@mechanic.com'
    },
    documents: {
      license: 'MECH001238',
      certifications: ['General Mechanic', 'Basic Diagnostics'],
      insurance: 'INS001238'
    },
    pricing: {
      consultationFee: 150,
      hourlyRate: 400,
      emergencyFee: 800
    },
    emergencyService: true,
    emergencyContact: '9876543214',
    languages: ['English', 'Tamil', 'Hindi'],
    isVerified: true,
    isActive: true
  },
  {
    specialization: 'Diesel Engine Expert',
    experience: 18,
    services: ['Engine Repair', 'General Maintenance'],
    rating: 4.8,
    totalReviews: 95,
    availability: true,
    workingHours: {
      start: '07:00',
      end: '19:00'
    },
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    location: {
      type: 'Point',
      coordinates: generateCoordinatesWithinRadius(userLocation.latitude, userLocation.longitude, 40)
    },
    serviceArea: 50,
    address: {
      street: '987 Diesel Street',
      city: 'Erode',
      state: 'Tamil Nadu',
      pincode: '638006'
    },
    contactInfo: {
      phone: '9876543215',
      whatsapp: '9876543215',
      email: 'gopal.diesel@mechanic.com'
    },
    documents: {
      license: 'MECH001239',
      certifications: ['Diesel Specialist', 'Heavy Vehicle Expert', 'Advanced Engine Repair'],
      insurance: 'INS001239'
    },
    pricing: {
      consultationFee: 500,
      hourlyRate: 800,
      emergencyFee: 2000
    },
    emergencyService: true,
    emergencyContact: '9876543215',
    languages: ['English', 'Tamil', 'Hindi', 'Telugu'],
    isVerified: true,
    isActive: true
  },
  {
    specialization: 'Two Wheeler Specialist',
    experience: 9,
    services: ['Engine Repair', 'Brake Service', 'Oil Change', 'General Maintenance'],
    rating: 4.5,
    totalReviews: 156,
    availability: true,
    workingHours: {
      start: '09:00',
      end: '18:00'
    },
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    location: {
      type: 'Point',
      coordinates: generateCoordinatesWithinRadius(userLocation.latitude, userLocation.longitude, 45)
    },
    serviceArea: 50,
    address: {
      street: '147 Bike Service Lane',
      city: 'Erode',
      state: 'Tamil Nadu',
      pincode: '638007'
    },
    contactInfo: {
      phone: '9876543216',
      whatsapp: '9876543216',
      email: 'karthik.bike@mechanic.com'
    },
    documents: {
      license: 'MECH001240',
      certifications: ['Two Wheeler Specialist', 'Bike Expert', 'Scooter Repair'],
      insurance: 'INS001240'
    },
    pricing: {
      consultationFee: 100,
      hourlyRate: 300,
      emergencyFee: 600
    },
    emergencyService: true,
    emergencyContact: '9876543216',
    languages: ['English', 'Tamil'],
    isVerified: true,
    isActive: true
  },
  {
    specialization: 'Luxury Car Specialist',
    experience: 14,
    services: ['Engine Repair', 'AC Service', 'Electrical Repair', 'Body Repair', 'General Maintenance'],
    rating: 4.9,
    totalReviews: 73,
    availability: true,
    workingHours: {
      start: '09:00',
      end: '17:00'
    },
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    location: {
      type: 'Point',
      coordinates: generateCoordinatesWithinRadius(userLocation.latitude, userLocation.longitude, 50)
    },
    serviceArea: 50,
    address: {
      street: '258 Luxury Auto Street',
      city: 'Erode',
      state: 'Tamil Nadu',
      pincode: '638008'
    },
    contactInfo: {
      phone: '9876543217',
      whatsapp: '9876543217',
      email: 'vijay.luxury@mechanic.com'
    },
    documents: {
      license: 'MECH001241',
      certifications: ['Luxury Car Specialist', 'Premium Service Expert', 'Advanced Diagnostics'],
      insurance: 'INS001241'
    },
    pricing: {
      consultationFee: 600,
      hourlyRate: 1000,
      emergencyFee: 2500
    },
    emergencyService: true,
    emergencyContact: '9876543217',
    languages: ['English', 'Tamil', 'Hindi'],
    isVerified: true,
    isActive: true
  }
];

// Function to create sample users and mechanics
async function seedMechanicsData() {
  try {
    console.log('Starting to seed mechanics data...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/vehicle-rental', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Clear existing mechanics
    await Mechanic.deleteMany({});
    console.log('Cleared existing mechanics data');
    
    for (let i = 0; i < sampleMechanics.length; i++) {
      const mechanicData = sampleMechanics[i];
      
      // Create a sample user for each mechanic
      const userData = {
        name: `Mechanic ${i + 1}`,
        email: mechanicData.contactInfo.email,
        phone: mechanicData.contactInfo.phone,
        password: 'mechanic123', // Default password for all mechanics
        role: 'mechanic',
        isActive: true
      };
      
      // Check if user already exists
      let user = await User.findOne({ email: userData.email });
      if (!user) {
        user = await User.create(userData);
        console.log(`Created user for mechanic ${i + 1}`);
      }
      
      // Create mechanic profile
      const mechanic = new Mechanic({
        ...mechanicData,
        userId: user._id
      });
      
      const savedMechanic = await mechanic.save();
      console.log(`Created mechanic ${i + 1}: ${mechanicData.specialization} at coordinates ${mechanicData.location.coordinates}`);
      console.log(`Saved mechanic ID: ${savedMechanic._id}`);
    }
    
    console.log('Successfully seeded mechanics data!');
    console.log(`Created ${sampleMechanics.length} mechanics within 50km of your location (${userLocation.latitude}, ${userLocation.longitude})`);
    
    // Display summary
    console.log('\n=== MECHANICS SUMMARY ===');
    sampleMechanics.forEach((mechanic, index) => {
      console.log(`${index + 1}. ${mechanic.specialization}`);
      console.log(`   Location: ${mechanic.location.coordinates[1]}, ${mechanic.location.coordinates[0]}`);
      console.log(`   Services: ${mechanic.services.join(', ')}`);
      console.log(`   Rating: ${mechanic.rating}/5 (${mechanic.totalReviews} reviews)`);
      console.log(`   Contact: ${mechanic.contactInfo.phone}`);
      console.log(`   Service Area: ${mechanic.serviceArea}km`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error seeding mechanics data:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seeding function
if (require.main === module) {
  seedMechanicsData();
}

module.exports = { seedMechanicsData, sampleMechanics };
