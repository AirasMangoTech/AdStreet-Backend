// Seeder file (seeder.js)
const mongoose = require('mongoose');
const  User  = require('../models/users'); 

// MongoDB connection setup
mongoose.connect('mongodb://localhost:27017/cocoprime', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Sample data for services
const usersData = [
  new User({
    "_id": "62d51755c36b03fe4a429082",
    "name": "Administrator",
    "email": "admin@cocoprime.ae",
    "password": "$2a$10$g5052fjz3/Oiyw1w9OUSK.OlDNAld2lUPLnG1dB0G38ZfUSUTX4ka", //123456
    "phone": "923128526242",
  }),
];

// Function to seed sample data
async function seedData() {
  try {
    // Clear existing data
    await User.deleteMany({});

    // Insert sample data
    const created = await User.create(usersData);
    console.log('Sample data seeded:', created);
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    // Close the connection after seeding
    mongoose.disconnect();
  }
}

// Seed the sample data
seedData();
