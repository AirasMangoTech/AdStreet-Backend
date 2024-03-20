const express = require('express');
const admeet_router = express.Router();
const regctrl = require('../controllers/admeet.controller');


admeet_router.post('/register', regctrl.register);
admeet_router.get('/getRegistrations', regctrl.getAllRegistrations);

module.exports = admeet_router;
