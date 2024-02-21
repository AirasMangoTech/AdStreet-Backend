const express = require("express");
const verifyToken = require("../middleware/auth");
const admin = require("../controllers/admin.controller");
const admin_route = express.Router();

// ADMIN AD ROUTES
admin_route.get('/getAll', [verifyToken], admin.getAllAds)
admin_route.patch('/approveAd/:id', [verifyToken], admin.approveAd);

//ADMIN BLOG ROUTES
admin_route.get('/getallblogs', [verifyToken], admin.getAllBlogs);

module.exports = admin_route;