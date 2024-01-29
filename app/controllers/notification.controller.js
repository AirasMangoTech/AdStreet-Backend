const  response  = require('../utils/responseHelpers');
const { ObjectId } = require("mongodb");
const logger = require("../logger");
require('dotenv').config()
const Notification = require('../models/notifications');


const getNotifications = async (req, res) => {
    try {
        let page = 1;
        let limit = 20;
        if (req.query.page) {
            page = parseInt(req.query.page.toString())
        }
        if (req.query.limit) {
            limit = parseInt(req.query.limit.toString())
        }
        var skip = (limit * page) - limit;

        const notifications = await Notification.find({user_id: req.user.id}).sort({_id: "desc"}).skip(skip).limit(limit)
        await Notification.updateMany({user_id: req.user.id, is_seen: false}, {$set: {is_seen: true}})
        return response.success(res, "Notifications List",{notifications, count: 0})
    } catch (error) {
        console.log(error);
        logger.error(`ip: ${req.ip},url: ${req.url},error:${JSON.stringify(error.stack)}`)
        return response.serverError(res, "Some Error Occurred")
    }
}

const getNotificationsCount = async (req, res) => {
    try {        
        const notifications = await Notification.count({user_id: req.user.id, is_seen: false})
        return response.success(res, "Notifications Count",{count: notifications})
    } catch (error) {
        logger.error(`ip: ${req.ip},url: ${req.url},error:${JSON.stringify(error.stack)}`)
        return response.serverError(res, "Some Error Occurred")
    }
}

module.exports = {
        getNotifications,
        getNotificationsCount,
}