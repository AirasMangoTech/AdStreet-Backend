const { Country,State,City } = require("../app/models");
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
require('dotenv').config();


async function seedData() {
  try {


    try {
      const data = require('../app/utils/referenceData/countries.json'); // Load JSON data
      const flattenedCountries = data.map(country => ({
        country_id: country.id,
        name: country.name,
        iso3: country.iso3,
        iso2: country.iso2,
        phone_code: country.phone_code,
        currency: country.currency,
      }));
  
      // Insert data into the countries collection
      const insertedCountries = await Country.insertMany(flattenedCountries);

      console.log(`Successfully inserted ${insertedCountries.length} countries into the database.`);
    } catch (error) {
      console.error('Error inserting countries:', error);
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
