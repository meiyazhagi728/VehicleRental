const { seedMechanicsData } = require('./seed-mechanics-data');

// Run the mechanics seeding
seedMechanicsData()
  .then(() => {
    console.log('Mechanics seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error running mechanics seeding:', error);
    process.exit(1);
  });
