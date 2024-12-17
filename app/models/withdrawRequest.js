const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const withdrawRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  transferImage: {
    type: String,
  },
  rejectReason: {
    type: String,
  },
  status: {
    type: Boolean,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const withdrawRequest = mongoose.model("withdrawRequest", withdrawRequestSchema);
module.exports = withdrawRequest;
