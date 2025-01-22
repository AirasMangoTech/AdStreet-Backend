const OnholdAd = require("../models/onholdAds");
const Wallet = require("../models/wallet");
const Notification = require("../models/notifications");
const FcmToken = require("../models/fcmTokens");
const Ad = require("../models/ad");
const { ROLE_IDS } = require("../utils/utility");
const sendNotification = require("../utils/sendNotifications");
const response = require("../utils/responseHelpers");

// Create a new onholdAd
exports.create = async (req, res) => {
  try {
    const { ad, employee, employer } = req.body;
    const adData = await Ad.findById(ad);
    if (!adData) {
      return res.status(400).json({
        status: "error",
        message: "Ad not found",
      });
    }
    const onholdAd = new OnholdAd({
      ad,
      employee,
      employer
    });
    await onholdAd.save();

    adData.isCompleted = true;
    await adData.save();

    res.status(201).json(onholdAd);
  } catch (error) {
    console.log(error);
    res.status(500).json("Server error");
  }
};

// Get all onholdAds
exports.getAllAds = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "asc",
      employeeId,
      employerId,
    } = req.query;
    const filter = {};

    if (employeeId) {
      filter.employeeId = employeeId;
    }

    if (employerId) {
      filter.employerId = employerId;
    }

    const onholdAds = await OnholdAd.find(filter)
      .populate("ad")
      .populate("employee")
      .populate("employer")
      .sort({ [sortBy]: order === "asc" ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await OnholdAd.countDocuments(filter);

    res.status(200).json({ total, onholdAds });
  } catch (error) {
    console.log(error);
    res.status(500).json("Server error");
  }
};

// Get a single onholdAd by ID
exports.findOne = async (req, res) => {
  try {
    const onholdAd = await OnholdAd.findById(req.params.id)
      .populate("ad")
      .populate("employee")
      .populate("employer");
    if (!onholdAd) {
      return res.status(404).json({
        status: "error",
        message: "Ad not found",
      });
    }
    res.status(200).json(onholdAd);
  } catch (error) {
    console.log(error);
    res.status(500).json("Server error");
  }
};

// Update an onholdAd by ID
exports.update = async (req, res) => {
  try {
    const onholdAd = await OnholdAd.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!onholdAd) {
      return res.status(404).json({
        status: "error",
        message: "Ad not found",
      });
    }
    res.status(200).json(onholdAd);
  } catch (error) {
    console.log(error);
    res.status(500).json("Server error");
  }
};

// Delete an onholdAd by ID
exports.delete = async (req, res) => {
  try {
    const onholdAd = await OnholdAd.findByIdAndDelete(req.params.id);
    if (!onholdAd) {
      return res.status(404).json({
        status: "error",
        message: "Ad not found",
      });
    }
    res.status(200).json({ status: "success", message: "Ad deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json("Server error");
  }
};

exports.payToUser = async (req, res) => {
  try {
    const { amount, user, ad } = req.body;

    if (req.user.role_id !== ROLE_IDS.ADMIN) {
      return response.forbidden(
        res,
        "You don't have permission to perform this action"
      );
    }

    if (!amount || !user) {
      return res.status(400).json({
        status: "error",
        message: "Amount and user are required",
      });
    }

    const adminWallet = await Wallet.findOne({ user: req.user.id });
    const userWallet = await Wallet.findOne({ user });
    const onholdAd = await OnholdAd.findOne({ ad }).populate("ad");

    if (!adminWallet || !userWallet) {
      return res.status(400).json({
        status: "error",
        message: "Wallet not found",
      });
    }

    if (adminWallet.amount < amount) {
      return res.status(400).json({
        status: "error",
        message: "Insufficient balance",
      });
    }

    adminWallet.amount -= amount;
    userWallet.amount += amount;
    onholdAd.status = "approved";
    await onholdAd.save();
    await adminWallet.save();
    await userWallet.save();

    const onholdNotiTitle = "Payment Received";
    const onholdNotiDescription = `You have received a payment of ${amount} for the job "${onholdAd.ad.title}" that was under review. The admin has approved the payment.`;

    const onholdNotiData = {
      id: ad,
      pagename: "",
      title: onholdNotiTitle,
      body: onholdNotiDescription,
    };

    const onholdNotifications = {
      title: onholdNotiTitle,
      content: onholdNotiDescription,
      icon: "check-box",
      data: JSON.stringify(onholdNotiData),
      user_id: user,
    };

    await Notification.create(onholdNotifications);

    const onholdTokens = await FcmToken.find({
      user_id: user,
    }).select("token");

    if (onholdTokens.length > 0) {
      const onholdTokenList = onholdTokens.map((tokenDoc) => tokenDoc.token);

      if (onholdTokenList.length > 0) {
        await sendNotification(
          onholdNotiTitle,
          onholdNotiDescription,
          onholdNotiData,
          onholdTokenList
        );
      }
    }

    res.status(200).json({
      status: "success",
      message: "Payment successful",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json("Server error");
  }
};
