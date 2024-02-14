const mongoose = require('mongoose');

const industrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Industry = mongoose.model('Industry', industrySchema);

module.exports = Industry;

