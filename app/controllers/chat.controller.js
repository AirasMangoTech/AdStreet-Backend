const Chat = require("../models/chats");

const getMessages = async (req, res) => {
  try {
    // Extract chatId and userId from request parameters
    const { id, userId } = req.body;

    // Validate chatId and userId
    if (!id || !userId) {
      return res.status(400).json({ error: 'ChatId and userId are required' });
    }

    // Query messages based on chatId and userId
    const messages = await Chat.find({ id, userId });

    // Check if messages are found
    if (messages.length === 0) {
      return res.status(404).json({ error: 'No messages found' });
    }

    // Return the messages
    return res.status(200).json({ messages });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getMessages,
};
