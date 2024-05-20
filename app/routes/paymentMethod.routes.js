const express = require("express");
const verifyToken = require("../middleware/auth");
const paymentMethod = require("../controllers/paymentMethod.controller");
const pm_route = express.Router();

pm_route.put(
  "/updatePaymentMethodStatus",
  [verifyToken],
  paymentMethod.updatePaymentMethodStatus
);

pm_route.get(
  "/getPaymentStatus",
  [verifyToken],
  paymentMethod.getPaymentStatus
);

pm_route.get(
  "/getKPToken",
  [verifyToken],
  paymentMethod.getKPToken
);

module.exports = pm_route;
