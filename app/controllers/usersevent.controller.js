const Event = require('../models/usersevents')
const response = require("../utils/responseHelpers");
const { sendEventEmail } = require("../utils/sendEventEmail");

exports.addUserEvent = async (req, res) => {
    try {
        const eventData = req.body

        const event = await Event.create(eventData)

        return response.success(res, "event created successfully.", { event });

    } catch (error) {
        console.error(`Error creating event: ${error}`);
        return response.serverError(res, "Error creating event");
    }
};
