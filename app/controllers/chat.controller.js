const Chat = require("../models/chats");
const response = require("../utils/responseHelpers");

// get all messages from chat id and user id
const getMessages = async (req, res) => {
  try {
    const { chatId, userId } = req.body;
    
    return response.success(res, "chatId and UserID loaded successfully", { chatId, userId });
  } catch (error) {
    return response.serverError(res, error.message, "Failed to load Messages");
  }
};

module.exports = {
  getMessages,
};
