const express = require("express");
const user = require("../controllers/users.controller");
const verifyToken = require("../middleware/auth");
const {verifyOTP} = require("../middleware/otp");
const ad = require("../controllers/add.controller");
const upload = require('../utils/imageUpload'); 
const user_route = express.Router();


user_route.post('/login', user.login);
user_route.post('/signup',[verifyOTP] ,user.signup);

user_route.get('/retrieveDataForRole', [verifyToken], user.retrieveDataForRole);
user_route.post('/postAd', [verifyToken], ad.postAd);
module.exports = user_route;

