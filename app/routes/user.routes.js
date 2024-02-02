const express = require("express");
const user = require("../controllers/users.controller");
const verifyToken = require("../middleware/auth");
const {verifyOTP} = require("../middleware/otp"); 
const {dupliUser} = require('../middleware/dupliUser')
const user_route = express.Router();


user_route.post('/login', user.login);
user_route.post('/signup',[dupliUser,verifyOTP] ,user.signup);
user_route.get('/allusers',[verifyToken], user.getAllUsers);
//user_route.get('/retrieveDataForRole', [verifyToken], user.retrieveDataForRole);
module.exports = user_route;

