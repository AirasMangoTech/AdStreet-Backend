const express = require("express");
const verifyToken = require("../middleware/auth");
const ad = require("../controllers/add.controller");
const ad_route = express.Router();
const {
  handleImageUpload,
  handleFileUpload,
  downloadFile,
} = require("../controllers/app.controller");
const { upload } = require("../utils/imageUpload");
const { uploadFiles } = require("../utils/fileUpload");

ad_route.post("/uploadImage", [upload.single("image")], handleImageUpload);
//upload file
ad_route.post("/uploadFiles", [uploadFiles.single("file")], handleFileUpload);
//download file
ad_route.get("/download", downloadFile);
//create an add
ad_route.post("/postAd", [verifyToken], ad.postAd);
// filter of user, title and category
ad_route.get("/getAllAds", [verifyToken], ad.getAllAds);
// adding applied status
ad_route.get("/getAdDetails", [verifyToken], ad.GetAdddetails);
//get route of acceptProposal
ad_route.put("/acceptProposal", [verifyToken], ad.acceptProposal);
//get route of getHiredUser for one ad
// ad_route.get('/getHiredUser', [verifyToken], ad.getHiredUser);
//get route of getHiredUsers for all ad
ad_route.get("/getHiredUsers", [verifyToken], ad.getHiredUsersAndAds);
//update ad status
ad_route.put("/updateAdStatus", [verifyToken], ad.updateAdStatus);
//handle ad status
//ad_route.get('/handleAdStatus', [verifyToken], ad.handleAdStatus);

// CREATE MILESTONE FOR ADS.
ad_route.patch("/createMilestone", [verifyToken], ad.createMilestone);
// SEND NOTIFICATION WHEN JOB COMPLETES - EMPLOYEE
ad_route.post(
  "/submitWorkByEmlpoyee",
  [verifyToken],
  uploadFiles.single("file"),
  ad.completeJobByEmployee
);
// SEND REQUEST TO ACCEPT OFFER BY EMPLOYEE
ad_route.post("/acceptOffer", [verifyToken], ad.sendRequestToAcceptAd);

// GET ALL MILESTONES
ad_route.get("/getMilestone", [verifyToken], ad.getMilestones);

ad_route.post("/createResponse", [verifyToken], ad.createResponse);
ad_route.get("/getResponses", [verifyToken], ad.getAllResponses);

ad_route.get("/getPermissions", [verifyToken], ad.getPermissions);
ad_route.put("/updatePermissions", [verifyToken], ad.updatePermissions);

// updatinf deature status
ad_route.put("/updateFeatureStatus", [verifyToken], ad.updateFeatureStatus);

module.exports = ad_route;
