const express = require('express');
const event_router = express.Router();
const cc = require('../controllers/event.controller');
const verifyToken = require("../middleware/auth");


event_router.post('/createEventDragon', cc.createEventDragon);
event_router.get('/getAllEventDragon', [verifyToken], cc.getAllEventDragon);
event_router.delete('/deleteEventDragon/:id',[verifyToken], cc.deleteEventDragon);

event_router.post('/createEventAdvision', cc.createEventAdvision);
event_router.get('/getAllEventAdvision', [verifyToken], cc.getAllEventAdvision);
event_router.delete('/deleteEventAdvision/:id',[verifyToken], cc.deleteEventAdvision);

module.exports = event_router;
