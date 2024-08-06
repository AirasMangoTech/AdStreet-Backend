const eventDragon = require("../models/eventDragon");
const eventAdvision = require("../models/eventAdvision");
const response = require("../utils/responseHelpers");
const { sendEventEmail } = require("../utils/sendEventEmail");

// For Event Dragon
const createEventDragon = async (req, res) => {
    try {
        const { name, email, phoneNumber, companyName, noOfTables, noOfSeats, category, price } = req.body;

        const event = new eventDragon({
            name,
            email,
            phoneNumber,
            companyName,
            noOfTables,
            noOfSeats,
            category,
            price
        });

        await event.save();

        var resp = await sendEventEmail(email, name, "eventDragon");

        return response.success(res, "The Event Dragon is successfully created", {
            event,
        });
    } catch (error) {
        console.log(error.message);
        return response.serverError(res, "Something bad happended try again aaaaaaaaa");
    }
};

const getAllEventDragon = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const events = await eventDragon.find({ isDelete: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

        const totalevents = await eventDragon.countDocuments({ isDelete: false });
        const totalPages = Math.ceil(totalevents / limit);
        const pagination = {
            totalevents,
            totalPages,
            currentPage: page,
            limit,
          };

        return response.success(res, "Successfully fetched all the event dragon.", { events, pagination });

    } catch (error) {
        return response.serverError(res, error.message);
    }
};

const deleteEventDragon = async (req, res) => {
    try {
        const event = await eventDragon.findById(req.params.id);
        if (!event) {
            return response.notFound(res, "event not found.");
        }
        else {
            event.isDelete = true;
            await event.save();
        }



        return response.success(res, "event deleted successfully");
    } catch (error) {
        return response.badRequest(res, error.message);
    }
};



// For Event Advision
const createEventAdvision = async (req, res) => {
    try {
        const { name, email, phoneNumber, companyName, noOfTables, category, price } = req.body;

        const event = new eventAdvision({
            name,
            email,
            phoneNumber,
            companyName,
            noOfTables,
            category,
            price
        });

        await event.save();

        var resp = await sendEventEmail(email, name, "eventAdvision");

        return response.success(res, "The Event Advision is successfully created", {
            event,
        });
    } catch (error) {
        console.log(error.message);
        return response.serverError(res, "Something bad happended try again aaaaaaaaa");
    }
};

const getAllEventAdvision = async (req, res) => {
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const events = await eventAdvision.find({ isDelete: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);


        const totalevents = await eventAdvision.countDocuments({ isDelete: false });
        const totalPages = Math.ceil(totalevents / limit);
        const pagination = {
            totalevents,
            totalPages,
            currentPage: page,
            limit,
          };

        return response.success(res, "Successfully fetched all the event dragon.", { events, pagination });

    } catch (error) {
        return response.serverError(res, error.message);
    }
};

const deleteEventAdvision = async (req, res) => {
    try {
        const event = await eventAdvision.findById(req.params.id);
        if (!event) {
            return response.notFound(res, "event not found.");
        }
        else {
            event.isDelete = true;
            await event.save();
        }

        return response.success(res, "event deleted successfully");
    } catch (error) {
        return response.badRequest(res, error.message);
    }
};

module.exports = {
    createEventDragon,
    getAllEventDragon,
    deleteEventDragon,

    createEventAdvision,
    getAllEventAdvision,
    deleteEventAdvision,

};
