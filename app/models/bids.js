const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const bidSchema = new mongoose.Schema({
  proposal_id: { type: mongoose.Schema.Types.ObjectId, ref: "Proposal" },
  individual_id: { type: mongoose.Schema.Types.ObjectId, ref: "Individual" },
  amount: Number,
  message: String,
  created_at: { type: Date, default: Date.now },
  updated_at: Date,
});

const Bid = mongoose.model("bids", bidSchema);
module.exports = Bid;
