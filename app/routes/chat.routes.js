// routes/chatRoutes.js
const express = require('express');
const chat_router = express.Router();
const chatctrl = require('../controllers/chat.controller');

chat_router.post('/send', chatctrl.sendMessage);
chat_router.get('/messages', chatctrl.getMessages);

module.exports = chat_router;
