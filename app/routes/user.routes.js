const express = require("express");
const user = require("../controllers/users.controller");
const verifyToken = require("../middleware/auth");
const { verifyOTP } = require("../middleware/otp");
const dupliUser = require("../middleware/dupliUser");
const user_route = express.Router();

user_route.post("/login", user.login);
user_route.post("/signup", [dupliUser, verifyOTP], user.signup);
//endpoint to get all users in the database regardlss of the roles
user_route.get("/allusers", [verifyToken], user.getAllUsers);
user_route.get("/getUser", [verifyToken], user.getUser);
user_route.put("/updateUser", [verifyToken], user.updateUser);
//user_route.get('/retrieveDataForRole', [verifyToken], user.retrieveDataForRole);
user_route.get("/getWalletHistory", [verifyToken], user.getWalletHistory);

module.exports = user_route;
