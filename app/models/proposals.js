const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

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
    ref: "users",
  }, 
  adId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ad',
  },
  image: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: Boolean,
    default: false
  },
});

const Proposal = mongoose.model("Proposal", proposalSchema);

module.exports = Proposal;
