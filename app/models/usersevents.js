const mongoose = require("mongoose");
const { isEmail } = require("validator");

const userEventSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  phoneNumber: {
    type: Number,
    required: [true, "Phone number is required."],
  },
  email: {
    type: String,
    trim: true,
    validate: [isEmail, "provide valid email."],
  },
  companyName: {
    type: String,
    required: [true, "Company name is required"],
  },
  passes: {
    type: Number,
  },
  ntnNumber: {
    type: Number,
  },
  category: {
    type: String,
  },
  totalSeats: {
    type: Number,
  },
  totalTables: {
    type: Number,
  },
  price : {
    type : Number,
  },
  book: {
    type: String,
    enum: ["table", "seat"],
  },
  event : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Banner"
  }
});

const Event = mongoose.model("UserEvent", userEventSchema);

module.exports = Event;
