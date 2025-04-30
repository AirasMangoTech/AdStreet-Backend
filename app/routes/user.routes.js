const express = require("express");
const user = require("../controllers/users.controller");
const verifyToken = require("../middleware/auth");
const { verifyOTP } = require("../middleware/otp");
const dupliUser = require("../middleware/dupliUser");
const checkDeletedUser = require("../middleware/deletedUser");
const user_route = express.Router();

user_route.post("/login", checkDeletedUser, user.login);
user_route.post("/logout", user.logout);
user_route.post("/social_auth", checkDeletedUser, user.socialLogin);
user_route.post("/signup", checkDeletedUser, dupliUser, verifyOTP, user.signup);
//endpoint to get all users in the database regardlss of the roles
user_route.get("/allusers", [verifyToken], user.getAllUsers);
user_route.get("/getUser", [verifyToken], user.getUser);
user_route.put("/updateUser", [verifyToken], user.updateUser);
//user_route.get('/retrieveDataForRole', [verifyToken], user.retrieveDataForRole);
user_route.get("/getWalletHistory", [verifyToken], user.getWalletHistory);

user_route.post(
  "/createWithdrawRequest",
  [verifyToken],
  user.createWithdrawRequest
);
user_route.put(
  "/updateWithdrawRequest/:id",
  [verifyToken],
  user.updateWithdrawRequest
);
user_route.get("/getWithdrawRequest", [verifyToken], user.getWithdrawRequest);
user_route.delete("/deleteUser", [verifyToken], user.deleteUser);

user_route.post("/send-otp", user.sendOTP);
user_route.post("/verify-otp", user.verifyOTP);
user_route.patch("/reset-password", user.resetPassword);

module.exports = user_route;
