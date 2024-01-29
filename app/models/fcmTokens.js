const mongoose = require('mongoose');
const { ObjectId } = require("mongodb");

const fcmTokenSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  token: {
    type: String,
    required: true
  }
}, { versionKey: false }
);

const FcmToken = mongoose.model('fcm_tokens', fcmTokenSchema);

module.exports = FcmToken;
