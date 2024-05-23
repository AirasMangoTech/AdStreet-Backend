const mongoose = require("mongoose");

const eaSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  ad: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ad",
    required: true,
  },
  dr: {
    type: Number,
    required: true,
  },
  cr: {
    type: Number,
    required: true,
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
});

const escrowAccount = mongoose.model("escrowAccount", eaSchema);
module.exports = escrowAccount;
