const express = require("express");
const verifyToken = require("../middleware/auth");
const banner = require("../controllers/banner.controller");
const banner_route = express.Router();

// Create a new Banner
banner_route.post("/create", [verifyToken], banner.createBanner);
banner_route.get("/getAll", [verifyToken], banner.getAllBanners);
banner_route.get("/getAllWEB",  banner.getAllBanners);
banner_route.put("/update/:id", [verifyToken], banner.updateBanner);
banner_route.delete("/delete/:id", [verifyToken], banner.deleteBanner);

module.exports = banner_route;
