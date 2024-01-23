const express = require("express");
const user = require("../controllers/users.controller");
const verifyToken = require("../middleware/auth");
const user_route = express.Router();


user_route.post('/login', user.login);
user_route.post('/signup', user.signup);
module.exports = user_route;

