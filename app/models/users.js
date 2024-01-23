const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

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
