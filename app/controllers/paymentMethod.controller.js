const Ad = require("../models/ad");
const Notification = require("../models/notifications");
const paymentMethod = require("../models/paymentMethod");
const sendNotification = require("../utils/sendNotifications");
const FcmToken = require("../models/fcmTokens");
const response = require("../utils/responseHelpers");
const { ROLE_IDS } = require("../utils/utility");
const mongoose = require("mongoose");
const moment = require("moment");
const crypto = require('crypto');


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

const getKPToken = async (req, res) => {
  try {

    const { adId } = req.query;

    if (!adId) {
      return response.badRequest(res, "Ad ID is required");
    }

    const ad = await Ad.findById(adId).populate('postedBy');

    if (!ad) {
      return response.notFound(res, "Ad not found");
    }
    
    const message = "Gateway details loaded successfully";

    return response.success(res, message, {
      order_id: ad.id,
      merchant_name: 'adsteet',
      amount: ad.budget,
      transaction_description: 'Activate the Job',
      customer_email: ad.postedBy.email,
      customer_mobile_number: ad.postedBy.phone_Number,
      order_date: moment().format('YYYY-MM-DD'),
      token: '',
      gross_amount: ad.budget,
      tax_amount: 0,
      discount: 0,
      signature: crypto.createHash('md5').update(process.env.INSTITUTION_ID + ad.id + ad.budget + process.env.KP_SECURED_KEY).digest('hex'),
      institution_id: process.env.INSTITUTION_ID,
      url: process.env.KP_REDIRECTION,
    });
  } catch (error) {
    console.log(error);
    return response.serverError(
      res,
      error.message,
      "Failed to load Gateway details"
    );
  }
};



module.exports = {
  updatePaymentMethodStatus,
  getPaymentStatus,
  getKPToken,
};
