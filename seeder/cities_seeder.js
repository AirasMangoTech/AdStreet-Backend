const { Country,State,City } = require("../app/models");
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
require('dotenv').config();


async function seedData() {
  try {


    try {
      const data = require('../app/utils/referenceData/cities.json'); // Load JSON data
      const flattenedCities = data.map(city => ({
        city_id: city.id,
        name: city.name,
        country_id: city.country_id,
        country_code: city.country_code,
        country_name: city.country_name,
        state_code: city.state_code,
        state_id: city.state_id,
        state_name: city.state_name,
      }));
  
      // Insert data into the countries collection
      const insertedCities = await City.insertMany(flattenedCities);

      console.log(`Successfully inserted ${insertedCities.length} cities into the database.`);
    } catch (error) {
      console.error('Error inserting cities:', error);
    }

    return Promise.resolve();
  
  } catch (error) {
    console.error("Error inserting data:", error);
  }
}

// Mongoose Connection
mongoose
  .connect("mongodb://127.0.0.1:27018/adStreet", { useNewUrlParser: true })
  .catch((err) => {
    console.log(err.stack);
    process.exit(1);
  })
  .then(() => {
    console.log("Connected to the database");
    seedData(); // Call the async function here
  });