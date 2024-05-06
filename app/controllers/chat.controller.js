const Message = require("../models/message");

const sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, text } = req.body;
    const message = await Message.create({ senderId, receiverId, text });
    global.io.to(receiverId).emit("receiveMessage", message); 
    res.status(200).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMessages = async (req, res) => {
  const { senderId, receiverId } = req.query;
  try {
    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort("createdAt");
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  sendMessage,
  getMessages,
};
