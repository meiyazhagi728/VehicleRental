// Utility function to seed mechanics data
export const seedMechanics = async () => {
  const sampleMechanics = [
    {
      specialization: 'Engine Repair',
      experience: 8,
      services: ['Engine Repair', 'Oil Change', 'Brake Service'],
      address: {
        street: '123 Main Street',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600001'
      },
      contactInfo: {
        phone: '9876543210',
        email: 'john.smith@example.com'
      },
      pricing: {
        hourlyRate: 500
      },
      availability: true,
      workingHours: {
        start: '09:00',
        end: '18:00'
      },
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      documents: {
        license: 'MECH001',
        certification: 'Certified Engine Specialist'
      },
      rating: 4.5,
      reviews: [
        {
          userId: 'user1',
          rating: 5,
          comment: 'Excellent service!',
          date: new Date()
        },
        {
          userId: 'user2',
          rating: 4,
          comment: 'Very professional',
          date: new Date()
        }
      ]
    },
    {
      specialization: 'AC Service',
      experience: 5,
      services: ['AC Service', 'Electrical Repair', 'General Maintenance'],
      address: {
        street: '456 Park Avenue',
        city: 'Madurai',
        state: 'Tamil Nadu',
        pincode: '625001'
      },
      contactInfo: {
        phone: '9876543211',
        email: 'raj.kumar@example.com'
      },
      pricing: {
        hourlyRate: 400
      },
      availability: true,
      workingHours: {
        start: '08:00',
        end: '17:00'
      },
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      documents: {
        license: 'MECH002',
        certification: 'AC Specialist'
      },
      rating: 4.2,
      reviews: [
        {
          userId: 'user3',
          rating: 4,
          comment: 'Good work',
          date: new Date()
        }
      ]
    },
    {
      specialization: 'Tire Service',
      experience: 12,
      services: ['Tire Service', 'Wheel Alignment', 'Battery Service'],
      address: {
        street: '789 Industrial Road',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        pincode: '641001'
      },
      contactInfo: {
        phone: '9876543212',
        email: 'suresh.patel@example.com'
      },
      pricing: {
        hourlyRate: 600
      },
      availability: false,
      workingHours: {
        start: '10:00',
        end: '19:00'
      },
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      documents: {
        license: 'MECH003',
        certification: 'Tire Specialist'
      },
      rating: 4.8,
      reviews: [
        {
          userId: 'user4',
          rating: 5,
          comment: 'Outstanding service!',
          date: new Date()
        },
        {
          userId: 'user5',
          rating: 5,
          comment: 'Highly recommended',
          date: new Date()
        }
      ]
    }
  ];

  try {
    // Try to create mechanics in the database
    const response = await fetch('/api/mechanics/seed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mechanics: sampleMechanics })
    });

    if (response.ok) {
      console.log('Mechanics seeded successfully');
      return true;
    } else {
      console.log('Failed to seed mechanics, using local data');
      return false;
    }
  } catch (error) {
    console.log('Error seeding mechanics:', error);
    return false;
  }
};
