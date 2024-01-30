const express = require("express");
const verifyToken = require("../middleware/auth");
const admin = require("../controllers/admin.controller");
const admin_route = express.Router();

admin_route.patch('/approve-ad/:adId', [verifyToken], admin.approveAd);

module.exports = admin_route;