// models/notification.js

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  icon: {
    type: String,
  },
  type: {
    type: String,
    },
  data: {
    type: Object,
    required: false
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  seen_at: {
    type: Date,
  },
  is_seen: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'accepted', 'rejected'], // Enum to ensure status is one of the specified values
    default: 'pending' // Default status when a notification is created
  }
}, { versionKey: false, timestamps: true } 
);

const Notification = mongoose.model('notifications', notificationSchema);

module.exports = Notification;
