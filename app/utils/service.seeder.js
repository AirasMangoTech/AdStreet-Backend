// Seeder file (seeder.js)
const mongoose = require('mongoose');
const  Service = require('../models/services'); 

// MongoDB connection setup
mongoose.connect('mongodb://localhost:27017/cocoprime', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Sample data for services
const servicesData = [
  {
    name: 'Home Cleaning',
    image: 'basic_cleaning.jpg',
    price: 50,
    pricing_type: 'hour',
    min_hours: 4,
    max_hours: 10,
    min_maids: 1,
    max_maids: 5,
    price_per_maid: 5,
    order: 1
  },
  {
    name: 'Deep Cleaning',
    image: 'deep_cleaning.jpg',
    price: 1,
    pricing_type: 'square foot',
    min_hours: 5,
    max_hours: 10,
    min_maids: 1,
    max_maids: 4,
    price_per_maid: 5,
    order: 2
  },
  {
    name: 'Folding & Ironing Service',
    image: 'carpet_cleaning.jpg',
    price: 1,
    pricing_type: 'square foot',
    min_hours: 1,
    max_hours: 4,
    min_maids: 1,
    max_maids: 2,
    price_per_maid: 5,
    order: 3
  },
  {
    name: 'AirBnB/Rental Home',
    image: 'window_cleaning.jpg',
    price: 70,
    pricing_type: 'hour',
    min_hours: 1,
    max_hours: 3,
    min_maids: 1,
    max_maids: 2,
    price_per_maid: 5,
    order: 4
  },
  {
    name: 'Office Cleaning',
    image: 'office_cleaning.jpg',
    price: 0,
    pricing_type: 'Contact us',
    min_hours: 0,
    max_hours: 0,
    min_maids: 0,
    max_maids: 0,
    price_per_maid: 0,
    order: 5
  },
 
];

// Function to seed sample data
async function seedData() {
  try {
    // Clear existing data
    await Service.deleteMany({});

    // Insert sample data
    const createdServices = await Service.create(servicesData);
    console.log('Sample data seeded:', createdServices);
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    // Close the connection after seeding
    mongoose.disconnect();
  }
}

// Seed the sample data
seedData();
