const mongoose = require('mongoose');
const { ObjectId } = require("mongodb");

const roleSchema = new mongoose.Schema({
  dec: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true, // e.g., 'admin', 'company', 'individual'
  },
  id: {
    userId: { type: mongoose.Types.ObjectId, ref: "Users" },
  }, // Optional: a brief description of the role
});

const Role = mongoose.model("roles", roleSchema);
module.exports = Role;