const mongoose = require("mongoose");
const Counter = require("./counter");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    //unique: true,
    trim: true,
  },
  image: {
    type: String,
    required: false,
  },
  type: {
    type: String,
    required: true,
    //default: "adbazaar"
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  num_id: {
    type: Number,
  },
});

categorySchema.pre("save", async function (next) {
  const categories = this;
  if (!categories.num_id) {
    const counter = await Counter.findOneAndUpdate(
      { type: categories.type },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    categories.num_id = counter.seq;
  }
  next();
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
