const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  type:{
    type: String,
  },  
  fields: [
    mongoose.Schema.Types.ObjectId
  ],
  emailMessage: {
    type: String,
    required: true,
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Ad = mongoose.model("Ad", adSchema);
module.exports = Ad;
