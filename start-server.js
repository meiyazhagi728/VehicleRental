#!/usr/bin/env node

const { spawn } = require('child_process');
const mongoose = require('mongoose');

// Test MongoDB connection first
const testMongoConnection = async () => {
  try {
    console.log('🔍 Testing MongoDB connection...');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vehicle-rental', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ MongoDB connection successful!');
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('\n💡 Please ensure MongoDB is running:');
    console.log('   - Start MongoDB service: mongod');
    console.log('   - Or start MongoDB with Docker: docker run -d -p 27017:27017 mongo');
    console.log('   - Or check if MongoDB is installed and running\n');
    return false;
  }
};

// Start the server
const startServer = () => {
  console.log('🚀 Starting server...');
  
  const server = spawn('node', ['server.js'], {
    stdio: 'inherit',
    shell: true
  });
  
  server.on('error', (error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });
  
  server.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
    process.exit(code);
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    server.kill('SIGINT');
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down server...');
    server.kill('SIGTERM');
  });
};

// Main execution
const main = async () => {
  console.log('🚀 Vehicle Rental System Startup');
  console.log('================================\n');
  
  const mongoConnected = await testMongoConnection();
  
  if (mongoConnected) {
    startServer();
  } else {
    console.log('❌ Cannot start server without MongoDB connection');
    process.exit(1);
  }
};

main().catch((error) => {
  console.error('❌ Startup failed:', error);
  process.exit(1);
});
