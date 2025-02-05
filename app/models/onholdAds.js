const mongoose = require("mongoose");

const onholdAdsSchema = new mongoose.Schema(
  {
    ad: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ad",
      required: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const OnholdAd = mongoose.model("OnholdAd", onholdAdsSchema);
module.exports = OnholdAd;
