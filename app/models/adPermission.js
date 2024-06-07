const mongoose = require("mongoose");

const pSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
  },
  isPost: {
    type: Boolean,
    default: true,
  },
  isApply: {
    type: Boolean,
    default: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const AdPermission = mongoose.model("AdPermission", pSchema);
module.exports = AdPermission;
