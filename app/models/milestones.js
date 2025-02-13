const mongoose = require("mongoose");

const milestoneSchema = new mongoose.Schema({
  ad: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ad",
    required: true,
  },
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  budget: {
    type: Number,
  },
  jobDuration: {
    type: String,
  },
  description: {
    type: String,
  },
});

const Milestone = mongoose.model("Milestone", milestoneSchema);
module.exports = Milestone;
