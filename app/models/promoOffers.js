const mongoose = require("mongoose");

const promoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  adId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ad",
  },
  blogId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Blog",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true
  },
});

const Promo = mongoose.model("Promo", promoSchema);

module.exports = Promo;
