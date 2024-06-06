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
});

const AdPermission = mongoose.model("AdPermission", pSchema);
module.exports = AdPermission;
