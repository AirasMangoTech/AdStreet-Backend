const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  reciever_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  message: {
    type: String,
  },
  isRead: {
    type: Boolean,
  },
  created_at: { type: Date, default: Date.now },
});
const Chat = mongoose.model("chats", ChatSchema);
module.export = Chat
