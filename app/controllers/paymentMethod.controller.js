const Ad = require("../models/ad");
const Notification = require("../models/notifications");
const paymentMethod = require("../models/paymentMethod");
const sendNotification = require("../utils/sendNotifications");
const FcmToken = require("../models/fcmTokens");
const response = require("../utils/responseHelpers");
const { ROLE_IDS } = require("../utils/utility");
const mongoose = require("mongoose");
const moment = require("moment");

const updatePaymentMethodStatus = async (req, res) => {
  try {
    const { isMandatory } = req.body;

    if (isMandatory == undefined) {
      return response.badRequest(res, "status is required");
    }

    const paymentMethodStatus = await paymentMethod.findOne();

    if (!paymentMethodStatus) {
      let pmstatus = new paymentMethod({
        isMandatory: isMandatory,
      });
      await pmstatus.save();
    } else {
      paymentMethodStatus.isMandatory = isMandatory;
      await paymentMethodStatus.save();
    }

    return response.success(res, "Payment method status updated successfully", {
      paymentMethodStatus,
    });
  } catch (error) {
    console.error(`Error updating payment method status: ${error}`);
    return response.serverError(res, "Error updating payment method status");
  }
};

const getPaymentStatus = async (req, res) => {
  try {
    const paymentMethodStatus = await paymentMethod.findOne();

    if (!paymentMethodStatus) {
      let pmstatus = new paymentMethod({
        isMandatory: false,
      });
      await pmstatus.save();

      paymentMethodStatus = pmstatus;
    }

    const message = "Payment Method status loaded successfully";

    return response.success(res, message, {
      isMandatory: paymentMethodStatus.isMandatory,
    });
  } catch (error) {
    console.log(error);
    return response.serverError(
      res,
      error.message,
      "Failed to load Payment Method"
    );
  }
};

module.exports = {
  updatePaymentMethodStatus,
  getPaymentStatus,
};
