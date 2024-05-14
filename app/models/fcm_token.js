const mongoose = require('mongoose');

const fcmTokenSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  token: {
    type: String,
    required: true
  },
  device_uid: {
    type: String,
    required: true
  }
}, { versionKey: false } // disables the '__v' field
);

const FcmToken = mongoose.model('fcm_tokens', fcmTokenSchema);

module.exports = FcmToken;
