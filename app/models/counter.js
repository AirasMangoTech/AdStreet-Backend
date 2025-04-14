const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema(
  {
    type: String,
    seq: Number,
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

const Counter = mongoose.model("Counter", counterSchema);
module.exports = Counter;
