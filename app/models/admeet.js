const mongoose = require("mongoose");
const { Schema } = mongoose;

// Define the schema for the registration form
const registrationSchemaADMEET = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      match: [/^[0-9]{10,15}$/, "Please fill a valid phone number"],
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      match: [/\S+@\S+\.\S+/, "Please fill a valid email address"],
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    industry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Industry",
    },
  },
  {
    timestamps: true, // Automatically include createdAt and updatedAt fields
  }
);

const Registration = mongoose.model("Registration", registrationSchemaADMEET);

module.exports = Registration;
