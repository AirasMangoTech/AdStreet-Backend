const { Country,State,City } = require("../app/models");
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
require('dotenv').config();


async function seedData() {
  try {


    try {
      const data = require('../app/utils/referenceData/states.json'); // Load JSON data
      const flattenedStates = data.map(state => ({
        state_id: state.id,
        name: state.name,
        country_id: state.country_id,
        country_code: state.country_code,
        country_name: state.country_name,
        state_code: state.state_code,
      }));
  
      // Insert data into the countries collection
      const insertedStates = await State.insertMany(flattenedStates);

      console.log(`Successfully inserted ${insertedStates.length} states into the database.`);
    } catch (error) {
      console.error('Error inserting states:', error);
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
