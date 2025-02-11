const mongoose = require("mongoose");

const milestoneSchema = new mongoose.Schema({
  ad: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ad",
    required: true,
  },
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  budget: {
    type: Number,
  },
  jobDuration: {
    type: String,
  },
});

const Milestone = mongoose.model("Milestone", milestoneSchema);
module.exports = Milestone;
