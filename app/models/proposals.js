const mongoose = require("mongoose");

const proposalSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  budget: {
    type: Number,
    required: true,
  },
  jobDuration: {
    type: String,
    required: true,
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }, // Assuming you have a User model
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Proposal = mongoose.model("Proposal", proposalSchema);

module.exports = Proposal;
