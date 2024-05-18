const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ad",
    required: false,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const wallet = mongoose.model("wallet", walletSchema);
module.exports = wallet;
