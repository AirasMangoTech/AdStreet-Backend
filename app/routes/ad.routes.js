const express = require("express");
const verifyToken = require("../middleware/auth");
const ad = require("../controllers/add.controller");
const ad_route = express.Router();
const { handleImageUpload } = require('../controllers/app.controller');
const {upload} = require('../utils/imageUpload');

ad_route.post('/uploadImage',[ upload.single('image')], handleImageUpload);
ad_route.post('/postAd', [verifyToken], ad.postAd);
ad_route.get('/getAllAds', [verifyToken], ad.getAllAds);
//ad_route.get('/getAdDetails' [verifyToken], ad.GetAdddetails);

module.exports = ad_route;