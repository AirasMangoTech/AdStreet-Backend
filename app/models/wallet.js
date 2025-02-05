const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    default: 0,
  },
  status: {
    type: String,
    required: true,
    default: "active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const wallet = mongoose.model("wallet", walletSchema);
module.exports = wallet;
