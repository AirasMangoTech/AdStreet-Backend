const express = require("express");
const router = express.Router();
const accountsController = require("../controllers/accountsController");
const verifyToken = require("../middleware/auth");

router.post("/createAccount", [verifyToken], accountsController.createAccount);
router.get("/getAccount", [verifyToken], accountsController.getAccountByNo);
router.get("/getAllAccounts", [verifyToken], accountsController.getAllAccounts);
router.patch("/updateAccount", [verifyToken], accountsController.updateAccount);
router.delete(
  "/deleteAccount",
  [verifyToken],
  accountsController.deleteAccount
);

module.exports = router;
