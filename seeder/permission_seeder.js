const AdPermission = require("../app/models/adPermission");
const mongoose = require("mongoose");
require('dotenv').config();

const permissions = [
  new AdPermission({
    "role": "individual",
    "isPost": true,
    "isApply": true,
  }),
  new AdPermission({
    "role": "provider",
    "isPost": true,
    "isApply": true,
  }),
  new AdPermission({
    "role": "seeker",
    "isPost": true,
    "isApply": true,
  }),
];


async function seedData() {
  try {
    // Mapping and data Seeding
    
    console.log('-------------Enter in the function------------');

    const AdPermissions = await AdPermission.insertMany(permissions);

    console.log(`Successfully inserted ${AdPermissions.length} role permissions into the database.`);

    // mongoose.disconnect();
  } catch (error) {
    console.error("Error inserting data:", error);
  }

}

// Mongoose Connection
mongoose
  .connect(String(process.env.DATABASE), { useNewUrlParser: true })
  .catch((err) => {
    console.log(err.stack);
    process.exit(1);
  })
  .then(() => {
    console.log("Connected to the database");
    seedData(); // Call the async function here
  });
