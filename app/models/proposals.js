const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const proposalSchema = new mongoose.Schema({
  company_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  title: String,
  description: String,
  budget: Number,
  deadline: Date,
  status: {
    type: String,
    default: "open",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: Date,
});

const Proposals = mongoose.model("proposals", proposalSchema);
module.exports = Proposals;
