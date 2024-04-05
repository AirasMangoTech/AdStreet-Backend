const express = require('express');
const adpro_router = express.Router();
const adproreg = require('../controllers/adpro.controller');


adpro_router.post('/register', adproreg.adproRegister);
adpro_router.get('/getAdpros', adproreg.getAdpros);


module.exports = adpro_router;
