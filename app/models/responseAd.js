const mongoose = require('mongoose');
const responseSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
    unique: true // Ensure that each response has a unique name
  },
});

// Create the model based on the schema
const AdResponse = mongoose.model('AdResponse', responseSchema);
module.exports = AdResponse;
