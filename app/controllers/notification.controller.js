const { Notification } = require("../models/notifications");
const response = require("../utils/responseHelpers");
const { ObjectId } = require("mongodb");
const logger = require("../logger");
require("dotenv").config();

module.exports.getNotifications = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    if (req.query.page) {
      page = parseInt(req.query.page.toString());
    }
    if (req.query.limit) {
      limit = parseInt(req.query.limit.toString());
    }
    var skip = limit * page - limit;

    const notifications = await Notification.find({ user_id: req.user.id })
      .sort({ _id: "desc" })
      .skip(skip)
      .limit(limit);
    const count = await Notification.count({ user_id: req.user.id });
    await Notification.updateMany(
      { user_id: req.user.id, is_seen: false },
      { $set: { is_seen: true } }
    );
    return response.success(res, "Notifications List", {
      notifications,
      count,
    });
  } catch (error) {
    console.log(error);
    logger.error(
      `ip: ${req.ip},url: ${req.url},error:${JSON.stringify(error.stack)}`
    );
    return response.serverError(res, "Some Error Occurred");
  }
};

module.exports.getNotificationsCount = async (req, res) => {
  try {
    const notifications = await Notification.count({
      user_id: req.user.id,
      is_seen: false,
    });
    return response.success(res, "Notifications Count", {
      count: notifications,
    });
  } catch (error) {
    logger.error(
      `ip: ${req.ip},url: ${req.url},error:${JSON.stringify(error.stack)}`
    );
    return response.serverError(res, "Some Error Occurred");
  }
};

module.exports.updateNotificationStatus = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const { status } = req.body; // New status provided by the client

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user_id: req.user.id },
      { status: status },
      { new: true } // Return the updated document
    );

    if (!notification) {
      return response.notFound(res, "Notification not found or access denied");
    }

    return response.success(res, "Notification status updated successfully", {
      notification,
    });
  } catch (error) {
    console.log(error);
    logger.error(
      `ip: ${req.ip}, url: ${req.url}, error: ${JSON.stringify(error.stack)}`
    );
    return response.serverError(
      res,
      "An error occurred while updating the notification status"
    );
  }
};
