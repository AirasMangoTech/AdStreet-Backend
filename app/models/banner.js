const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Banner = mongoose.model("Banner", bannerSchema);

module.exports = Banner;
