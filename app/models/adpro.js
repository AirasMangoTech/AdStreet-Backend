// InquiryModel.js

const mongoose = require('mongoose');
const { Schema } = mongoose;

const inquirySchema = new Schema({
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true },
  companyName: { type: String, required: true },
  industry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Industry"
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service"
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category"
  },
  budget: { type: String },
  address: { type: String },
  timeline: { type: String },
  details: { type: String },
  links: { type: String },
  file: { type: String },
  isContacted: { type: Boolean, default: false }
}, {
  timestamps: true
});

const Inquiry = mongoose.model('Inquiry', inquirySchema);

module.exports = Inquiry;
