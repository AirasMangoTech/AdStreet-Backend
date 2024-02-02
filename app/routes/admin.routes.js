const express = require("express");
const verifyToken = require("../middleware/auth");
const admin = require("../controllers/admin.controller");
const admin_route = express.Router();

admin_route.get('/getAll', [verifyToken], admin.getAllAds)
admin_route.patch('/approveAd/:id', [verifyToken], admin.approveAd);

module.exports = admin_route;