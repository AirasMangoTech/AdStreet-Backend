const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: [true, 'Event name is required.'],
    lowerCase: true
  },
  eventDate: {
    type: String,
    required: [true, 'Event date is required.']
  },
  eventStartTime: {
    type: String,
    required: [true, 'When will event start.']
  },
  eventEndTime: {
    type: String,
    required: [true, 'When will event end.']
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
});

const Banner = mongoose.model("Banner", bannerSchema);

module.exports = Banner;
