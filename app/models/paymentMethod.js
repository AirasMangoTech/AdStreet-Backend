const mongoose = require("mongoose");

const pmSchema = new mongoose.Schema({
  isMandatory: {
    type: Boolean,
    default: false,
  },
});

const PaymentMethod = mongoose.model("PaymentMethod", pmSchema);
module.exports = PaymentMethod;
