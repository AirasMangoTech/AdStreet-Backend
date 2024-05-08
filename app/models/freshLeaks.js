const mongoose = require("mongoose");

const leaksSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  blogId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Blog",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  url:{
        type: String,
       // required: true,
  }
});

const FreshLeaks = mongoose.model("FreshLeaks", leaksSchema);

module.exports = FreshLeaks;
