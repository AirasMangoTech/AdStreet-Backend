const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  eventName: {
    type: String,
    lowerCase: true,
  },
  eventDate: {
    type: String,
  },
  eventStartTime: {
    type: String,
  },
  eventEndTime: {
    type: String,
  },
  venue: {
    type: String,
  },
  formImg: {
    type: String,
  },
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
  type: {
    type: String,
    //enum: ["home", "category", "product"],
    default: "home",
  },
  url: {
    type: String,
    // required: true,
  },
  blog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Blog",
  },
  mailBody: {
    type: String,
  },
  isEvent: {
    type: Boolean,
  },
  table: [
    {
      category: String,
      price: Number,
    },
  ],
  seat: [
    {
      category: String,
      price: Number,
    },
  ],
  price: Number,
  logo: {
    type: String,
  },
  blogUrl: {
    type: String,
  },
});

const Banner = mongoose.model("Banner", bannerSchema);

module.exports = Banner;
