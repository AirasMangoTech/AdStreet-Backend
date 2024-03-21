const express = require('express');
const adpro_router = express.Router();
const adproreg = require('../controllers/adpro.controller');


adpro_router.post('/register', adproreg.adproRegister);

module.exports = adpro_router;
