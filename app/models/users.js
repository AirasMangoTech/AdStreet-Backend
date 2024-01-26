const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const ROLE_IDS = require("../utils/utility");
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  roles: {
    type: String,
    enum: [ROLE_IDS.BRAND_COMPANY, ROLE_IDS.AGENCY, ROLE_IDS.INDIVIDUAL, ROLE_IDS.ADMIN],
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone_Number: Number,
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: Date,
});
const Users = mongoose.model("users", UserSchema);
module.exports = Users;
