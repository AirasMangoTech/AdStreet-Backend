const mongoose = require("mongoose");

const feeSchema = mongoose.Schema({
  fee: {
    type: Number,
    required: [true, "Please provide fee."],
  },
});

const PlatformFee = mongoose.model("PlatformFee", feeSchema);

module.exports = PlatformFee;
