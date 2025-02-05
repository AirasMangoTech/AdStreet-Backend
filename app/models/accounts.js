const mongoose = require("mongoose");

const accountsSchema = mongoose.Schema({
  accountHolderName: {
    type: String,
    required: [true, "Provide account holder name."],
  },
  accountNumber: {
    type: String,
    required: [true, "Please provide iban/account number."],
  },
  bankName: {
    type: String,
    required: [true, "Please provide bank name."],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: [true, "Please provide user id to whom this account belongs."],
  },
});

const Account = mongoose.model("Account", accountsSchema);

module.exports = Account;
