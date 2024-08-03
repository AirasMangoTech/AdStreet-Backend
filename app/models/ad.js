const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const adSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  featured:{
    type: Boolean,
    default: false,
  },  
  category: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
  ],
  image: [
    {
      type: String,
    },
  ],
  links: [
    {
      type: String,
    },
  ],
  description: {
    type: String,
    required: true,
  },
  budget: {
    type: Number,
    required: true,
  },
  jobDuration: {
    type: String,
    required: true,
  },
  Proposal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Proposal",
    required: false,
  },
  isApproved: {
    type: Boolean,
    default: null,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  hired_user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  isHired: {
    type: Boolean,
    default: false,
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  response: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AdResponse",
  },
  valid_till: {
    type: Date,
    //default: () => moment().endOf('day').toDate();
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isActivated: {
    type: Boolean,
    default: false,
  },
});

const Ad = mongoose.model("Ad", adSchema);
module.exports = Ad;
