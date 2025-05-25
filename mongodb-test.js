#!/usr/bin/env node

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('🔍 MongoDB Connection Diagnostics');
console.log('=====================================\n');

// Check environment variables
console.log('1. Checking environment variables...');
if (!process.env.MONGODB_URI) {
  console.log('❌ MONGODB_URI is not defined');
  console.log('💡 Create a .env file with your MongoDB Atlas URI');
  process.exit(1);
} else {
  console.log('✅ MONGODB_URI found');
  console.log(`📍 URI: ${process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
}

// Attempt connection
console.log('\n2. Attempting to connect to MongoDB...');

const connectWithTimeout = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // 10 seconds
      maxPoolSize: 1,
    });

    console.log('✅ Connection successful!');
    console.log(`🏠 Host: ${mongoose.connection.host}`);
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🔌 Status: ${mongoose.connection.readyState}`);

    // Create a test collection
    console.log('\n3. Testing database operation...');
    const TestSchema = new mongoose.Schema({ test: String });
    const TestModel = mongoose.model('Test', TestSchema);

    const testDoc = await TestModel.create({ test: 'successful connection' });
    console.log('✅ Test document created:', testDoc._id);

    await TestModel.deleteOne({ _id: testDoc._id });
    console.log('✅ Test document deleted');

    console.log('\n🎉 MongoDB connection fully functional!');
  } catch (error) {
    console.log('❌ Connection error:', error.message);

    if (error.message.includes('authentication failed')) {
      console.log('\n💡 Possible solutions:');
      console.log('   • Verify your username and password');
      console.log('   • Make sure the user has read/write permissions');
    } else if (error.message.includes('IP not whitelisted')) {
      console.log('\n💡 Possible solutions:');
      console.log('   • Add your IP to the whitelist in MongoDB Atlas');
      console.log('   • Or use 0.0.0.0/0 to allow all IPs (development only)');
    } else if (error.message.includes('getaddrinfo ENOTFOUND')) {
      console.log('\n💡 Possible solutions:');
      console.log('   • Check your internet connection');
      console.log('   • Verify that the cluster URI is correct');
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

connectWithTimeout();
