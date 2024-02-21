const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  blogCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BlogCategory",
    required: true,
  },
  image: {
    type: String,
    required: false,
  },
  additional: {
    name:{
      type: String,
    },
    email:{
      type:String,
    },
    phone_num : {
      type: String,
    },
    location:{
      type: String,
    },
    date: {
      type: Date,
    },
    num_people: {
      type: Number,
    },
    f_link: {
      type: String,
    },
    t_link: {
      type: String,
    },
    l_link: {
      type: String,
    },
    w_link: {
      type: String,
    },
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
