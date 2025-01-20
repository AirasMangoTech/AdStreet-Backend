const Ad = require("../models/ad");
const User = require("../models/users");
const Notification = require("../models/notifications");
const paymentMethod = require("../models/paymentMethod");
const sendNotification = require("../utils/sendNotifications");
const FcmToken = require("../models/fcmTokens");
const response = require("../utils/responseHelpers");
const apiRequest = require("../utils/apiRequest");
const { ROLE_IDS } = require("../utils/utility");
const mongoose = require("mongoose");
const moment = require("moment");
const crypto = require("crypto");
const paymentlog = require("../models/paymentLogs");
const escrowAccount = require("../models/escrowAccount");

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
    let paymentMethodStatus = await paymentMethod.findOne();

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

const getGatewayToken = async (req, res) => {
  try {
    const { adId } = req.body;

    if (!adId) {
      return response.badRequest(res, "Ad ID is required");
    }

    const ad = await Ad.findById(adId).populate("postedBy");

    if (!ad) {
      return response.notFound(res, "Ad not found");
    }

    const tokenData = await apiRequest.sendRequest(process.env.KPTOKEN_URL, {
      institutionID: process.env.INSTITUTION_ID,
      kuickpaySecuredKey: process.env.KP_SECURED_KEY,
    });

    if (tokenData.responseCode !== "00") {
      return response.badRequest(res, tokenData.message);
    }

    const message = "Gateway details loaded successfully";

    return response.success(res, message, {
      order_id: ad.id,
      merchant_name: process.env.MERCHANT_NAME,
      amount: ad.budget,
      transaction_description: "Activate the Job",
      customer_email: ad.postedBy.email,
      customer_mobile_number: ad.postedBy.phone_Number,
      order_date: moment().format("YYYY-MM-DD"),
      token: tokenData.auth_token,
      gross_amount: ad.budget,
      tax_amount: 0,
      discount: 0,
      signature: crypto
        .createHash("md5")
        .update(
          process.env.INSTITUTION_ID +
            ad.id +
            ad.budget +
            process.env.KP_SECURED_KEY
        )
        .digest("hex"),
      institution_id: process.env.INSTITUTION_ID,
      url: process.env.KP_REDIRECTION_URL,
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

const saveGatewayResponse = async (req, res) => {
  try {
    //const { transactionId, orderId, responseCode, responseObject } = req.body;

    const {
      TransactionId,
      OrderId,
      ResponseCode,
      ResponseMessage,
      Signature,
      amountPaid,
      discountAmount,
      responseObject,
    } = req.body;
    // {"OrderId": "664b183154b14730f13319b9", "ResponseCode": "00", "ResponseMessage": "Transaction%20completed%20successfully", "Signature": "8663b707d69d3196a256127582a29e69", "TransactionId": "2407240407476134", "amountPaid": "125.79", "discountAmount": "0"}

    if (!ResponseCode) {
      return response.badRequest(res, "Response code is required");
    }

    const ad = await Ad.findById(OrderId)
      .populate("postedBy")
      .populate("hired_user");

    let log = new paymentlog({
      user: ad.postedBy.id,
      ad: ad.id,
      amount: amountPaid,
      transactionId: TransactionId,
      responseCode: ResponseCode,
      response: responseObject,
    });

    await log.save();

    if (ResponseCode === "00") {
      const admin = await User.findOne({ roles: "ADMIN" });
      let escrow = new escrowAccount({
        adId: ad._id,
        user: admin._id,
        amount: ad.budget,
        description: "Amount credited - " + ResponseMessage,
        type: "credit", // WITHDRAW  // REFUND // COMMISSION
      });

      const wallet = await findOneAndUpdate(
        { user_id: admin.id },
        { $inc: { amount: ad.budget } }
      );
      
      await escrow.save();

      ad.isActivated = true;
      await ad.save();

      if (ad.isHired) {
        let notiData_user = {};
        let notification_user = new Notification({
          title: `The job you are hired for is activated.`,
          content: `The job you are hired for is activated.`,
          icon: "check-box",
          data: JSON.stringify(notiData_user),
          user_id: ad.hired_user.id,
        });
        await notification_user.save();
        let notiTokens_user = await FcmToken.find({
          user_id: ad.hired_user.id,
        });
        for (let i = 0; i < notiTokens_user.length; i++) {
          const token_user = notiTokens_user[0];

          await sendNotification(
            `You've received a new notification "${req.body.name}"`,
            notiData_user,
            token_user.token
          );
        }
      }

      let notiData = {};
      let notification = new Notification({
        title: `Your job is activated.`,
        content: `Your job is activated.`,
        icon: "check-box",
        data: JSON.stringify(notiData),
        user_id: ad.postedBy.id,
      });
      await notification.save();
      let notiTokens = await FcmToken.find({ user_id: ad.postedBy.id });
      for (let i = 0; i < notiTokens.length; i++) {
        const token = notiTokens[0];

        await sendNotification(
          `You've received a new notification "${req.body.name}"`,
          notiData,
          token.token
        );
      }
    }

    const message = "Gateway response saved successfully";

    return response.success(res, message, {
      log,
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

const getescrowAccountLedger = async (req, res) => {
  try {
    let query = {};

    if (req.query.description) {
      query.description = { $regex: new RegExp(req.query.description, "i") };
    }

    if (req.query.user_id) {
      query.user = new mongoose.Types.ObjectId(req.query.user_id);
    }
    if (req.query.adId) {
      query.ad = new mongoose.Types.ObjectId(req.query.adId);
    }

    const getStartOfDay = (date) => {
      return moment(date).startOf("day").toDate();
    };
    const getEndOfDay = (date) => {
      return moment(date).endOf("day").toDate();
    };
    if (req.query.from && req.query.to) {
      query.createdAt = {
        $gte: getStartOfDay(new Date(req.query.from)),
        $lte: getEndOfDay(new Date(req.query.to)),
      };
    } else if (req.query.from) {
      query.createdAt = {
        $gte: getStartOfDay(new Date(req.query.from)),
      };
    } else if (req.query.to) {
      query.createdAt = {
        $lte: getEndOfDay(new Date(req.query.to)),
      };
    }
    // Date range for createdAt
    if (req.query.created_at_from && req.query.created_at_to) {
      query.createdAt = {
        $gte: getStartOfDay(new Date(req.query.created_at_from)),
        $lte: getEndOfDay(new Date(req.query.created_at_to)),
      };
    } else if (req.query.created_at_from) {
      query.created_at = {
        $gte: getStartOfDay(new Date(req.query.created_at_from)),
      };
    } else if (req.query.created_at_to) {
      query.created_at = {
        $lte: getEndOfDay(new Date(req.query.created_at_to)),
      };
    }

    let userLookupPipeline = [
      {
        $match: {
          $expr: {
            $eq: ["$_id", "$$user"],
          },
        },
      },
      {
        $project: {
          password: 0, // Exclude the password field
        },
      },
    ];
    if (req.query.role) {
      userLookupPipeline.unshift({
        $match: {
          roles: req.query.role, // Assumes roles field exists and contains the role
        },
      });
    }

    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default limit to 10 items
    const skip = (page - 1) * limit;

    const escrowAccountLedger = await escrowAccount.aggregate([
      {
        $match: query,
      },
      {
        $lookup: {
          from: "ads",
          localField: "ad",
          foreignField: "_id",
          as: "ad",
        },
      },
      {
        $lookup: {
          from: "users",
          let: { user: "$user" },
          pipeline: userLookupPipeline,
          as: "user",
        },
      },
      {
        $project: {
          _id: 1,
          description: 1,
          amount: 1,
          cr: 1,
          dr: 1,
          type: 1,
          user: { $arrayElemAt: ["$user", 0] },
          ad: { $arrayElemAt: ["$ad", 0] },
          createdAt: 1,
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    const totalCount = await escrowAccount.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    return response.success(
      res,
      "All escrow account ledger retrieved successfully",
      {
        escrowAccountLedger,
        totalCount,
        totalPages,
        currentPage: page,
      }
    );
  } catch (error) {
    console.error(`Error getting all escrow account ledger: ${error}`);
    return response.serverError(res, "Error getting all escrow account ledger");
  }
};

module.exports = {
  updatePaymentMethodStatus,
  getPaymentStatus,
  getGatewayToken,
  saveGatewayResponse,
  getescrowAccountLedger,
};
