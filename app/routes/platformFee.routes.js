const express = require("express");
const router = express.Router();
const feeController = require("../controllers/platformFee.controller");
const verifyToken = require("../middleware/auth");

router.post("/addFee", verifyToken, feeController.createFee);
router.patch("/updateFee", verifyToken, feeController.updateFee);
router.delete("/deleteFee", verifyToken, feeController.deleteFee);

module.exports = router;
