const express = require("express");
const user = require("../controllers/usersevent.controller");
const verifyToken = require("../middleware/auth");
const user_route = express.Router();

user_route.post("/register", user.addUserEvent);
user_route.post("/sendMail", [verifyToken], user.mailTo);
user_route.get("/getEvents", [verifyToken], user.getAllUserEvents);
user_route.patch("/updateEvent", [verifyToken], user.updateUserEvent);
user_route.delete("/deleteEvent", [verifyToken], user.deleteUserEvent);

module.exports = user_route;
