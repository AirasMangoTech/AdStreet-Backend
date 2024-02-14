const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  image: {
    type: String,
    required: false,
  },
  type: {
    type: String,
    required: true,
    //default: "adbazaar"
  },
  isActive:{
    type: Boolean,
    default: true
  }
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
