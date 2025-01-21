const mongoose = require("mongoose");

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
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: [
      true,
      "Please let us know in which account you want payment to be credited in.",
    ],
  },
  transferImage: {
    type: String,
  },
  rejectReason: {
    type: String,
  },
  isWithdrawed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const withdrawRequest = mongoose.model(
  "withdrawRequest",
  withdrawRequestSchema
);
module.exports = withdrawRequest;
