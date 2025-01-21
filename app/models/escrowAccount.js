const mongoose = require("mongoose");

const eaSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  amount: {
    type: Number,
  },
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  adId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ad",
  },
});

const escrowAccount = mongoose.model("escrowAccount", eaSchema);
module.exports = escrowAccount;
