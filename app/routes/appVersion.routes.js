const express = require("express");
const router = express.Router();
const versionController = require("../controllers/appVersion.controller");

router.post("/createVersion", versionController.createVersion);
router.get("/getAllVersions", versionController.getAllVersions);
router.patch("/updateVersion/:id", versionController.updateVersion);
router.delete("/deleteVersion/:id", versionController.deleteVersion);

module.exports = router;
