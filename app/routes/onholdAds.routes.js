const express = require("express");
const router = express.Router();
const controller = require("../controllers/onholdAds.controller");
const verifyToken = require("../middleware/auth");

router.post("/create", [verifyToken], controller.create);
router.put("/update/:id", [verifyToken], controller.update);
router.get("/getAll", [verifyToken], controller.getAllAds);
router.delete("/delete/:id", [verifyToken], controller.delete);
router.post("/pay", [verifyToken], controller.payToUser);

module.exports = router;
