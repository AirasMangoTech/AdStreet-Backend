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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Promo = mongoose.model("Promo", promoSchema);

module.exports = Promo;
