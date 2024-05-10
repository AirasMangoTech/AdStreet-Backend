// routes/chatRoutes.js
const express = require('express');
const chat_router = express.Router();
const chatctrl = require('../controllers/chat.controller');

chat_router.post('/send', chatctrl.createChat);
chat_router.get('/getMessages', chatctrl.getMessages);
chat_router.get('/getChats', chatctrl.getChats);

module.exports = chat_router;
