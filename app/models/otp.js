const mongoose = require("mongoose");

const otpCodeSchema = new mongoose.Schema({
  device_id: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  is_verified: {
    type: Boolean,
    default: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
    index: { expires: "5m" }, // OTP expires after 5 minutes
  },
});

const OTPCode = mongoose.model("OTPCode", otpCodeSchema);
module.exports = OTPCode;
