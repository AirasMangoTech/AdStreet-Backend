const mongoose = require("mongoose");

const OTPSchema = new mongoose.Schema(
  {
    device_id: {
      type: String,
    },
    api_name: {
      type: String,
    },
    code: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    email: {
      type: String,
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    expired_at:{
        type : Date ,
    },
    created_at: {
      type: Date,
      default: Date.now,
      index: { expires: "5m" },
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);
const OTPCode = mongoose.model("OTPCode", OTPSchema);
module.exports = OTPCode;
