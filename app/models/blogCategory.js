const mongoose = require("mongoose");

const blogCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  image: {
    type: String, 
    required: false, 
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const BlogCategory = mongoose.model("BlogCategory", blogCategorySchema);
module.exports = BlogCategory;
