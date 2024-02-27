const mongoose = require('mongoose');

const PortfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
   // required: true
  },
  image: [{
    type: String // Assuming URLs of the pictures
  }],
  projectUrl: {
    type: String
  },
  title: {
    type: String,
    required: true
  },
  completionDate: {
    type: Date
  },
  description: {
    type: String
  }
});

const Portfolio = mongoose.model('Portfolio', PortfolioSchema);

module.exports = Portfolio;
