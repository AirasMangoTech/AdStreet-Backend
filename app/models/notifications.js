const mongoose = require('mongoose');
const { ObjectId } = require("mongodb");

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
}, { versionKey: false, timestamps: true } 
);

const Notification = mongoose.model('notifications', notificationSchema);

module.exports = Notification;
