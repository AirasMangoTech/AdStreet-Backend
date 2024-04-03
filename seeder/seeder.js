const User = require("../app/models/users");
const Role = require("../app/models/roles");
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
require('dotenv').config();

//Master Admin User Data
const users = [
  new User({
    "_id": new ObjectId("62d51755c36b03fe4a429082"),
    "name": "Airas Khan",
    "email": "admin@mynda.com",
    "password": "$2a$10$g5052fjz3/Oiyw1w9OUSK.OlDNAld2lUPLnG1dB0G38ZfUSUTX4ka", //123456
    "phone": "923128526242",
    "picture": "/media/default_avatar.png",
    "role": new ObjectId("62d5190befb00e5e7be49f3c"),
    "is_deleted": false,
    "is_active": true,
    "last_login_time": null,
  }),
];

// //Roles Data
const roles = [
  new Role({
    "_id": new ObjectId("62d5190befb00e5e7be49f3c"),
    "name": "Admin",
    "short_name": "A",
  }),
  new Role({
    "_id": new ObjectId("62d537874fe9ca41cade0ddf"),
    "name": "User",
    "short_name": "U",
  }),
];

async function seedData() {
  try {
    // Mapping and data Seeding
    for (const role of roles) {
      await role.save();
    }
    console.log("Roles Inserted!");

    for (const user of users) {
      await user.save();
    }
    console.log("Users Inserted!");

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
