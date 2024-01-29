const express = require("express");
const notictrl = require("../controllers/notification.controller");
const user = require("../controllers/users.controller");
const verifyToken = require("../middleware/auth");
const noti_route = express.Router();


noti_route.get('/getNoti',[verifyToken], notictrl.getNotifications);
noti_route.get('/count',[verifyToken], notictrl.getNotificationsCount);

//noti_route.post('/test',[verifyToken], user.testNotification);


module.exports = noti_route;
