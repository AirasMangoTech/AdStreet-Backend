const UserEvent = require('../models/usersevents');
const Event = require('../models/banner')
const response = require("../utils/responseHelpers");
const { sendEventEmail } = require("../utils/sendEventEmail");

const getDateDetails = (dateString) => {
    if (!dateString) throw new Error("Invalid date string");
    const [day, month, year] = dateString.split('/').map(Number);

    const date = new Date(year, month - 1, day); // month is 0-indexed

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const monthsOfYear = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    const dayName = daysOfWeek[date.getDay()];
    const monthName = monthsOfYear[date.getMonth()];
    const dateNumber = date.getDate();

    return { dayName, monthName, dateNumber, year };
};

exports.addUserEvent = async (req, res) => {
    try {
        const eventData = req.body;
        const eventName = req.query.event.toLowerCase();

        const event = await Event.findOne({ eventName });

        if (!event) {
            return response.badRequest(res, `No event named "${eventName}" exists.`);
        }

        if (!event.eventDate) {
            return response.badRequest(res, "Event date is not defined.");
        }

        event.eventDetails = getDateDetails(event.eventDate);

        const userevent = await UserEvent.create(eventData);

        const name = userevent.name.charAt(0).toUpperCase() + userevent.name.slice(1)
        await sendEventEmail(userevent.email, name, event);
        return response.success(res, "Event created successfully.", { event: userevent });

    } catch (error) {
        console.error(`Error creating event: ${error.message}`);
        return response.serverError(res, "Error creating event");
    }
};

exports.getAllUserEvents = async (req, res) => {
    try {
        let query = {};

        if (req.query.name) {
            query.name = { $regex: new RegExp(req.query.name, "i") };
        }

        if (req.query.email) {
            query.email = { $regex: new RegExp(req.query.email, "i") };
        }

        if (req.query.phoneNumber) {
            query.phoneNumber = req.query.phoneNumber;
        }

        if (req.query.companyName) {
            query.companyName = { $regex: new RegExp(req.query.companyName, "i") };
        }

        if (req.query.category) {
            const categories = req.query.category.split(",");
            query.category = { $in: categories };
        }

        if (req.query.book) {
            query.book = req.query.book;
        }

        if (req.query.passes_from || req.query.passes_to) {
            query.passes = {};
            if (req.query.passes_from) {
                query.passes.$gte = parseInt(req.query.passes_from);
            }
            if (req.query.passes_to) {
                query.passes.$lte = parseInt(req.query.passes_to);
            }
        }

        if (req.query.totalSeats_from || req.query.totalSeats_to) {
            query.totalSeats = {};
            if (req.query.totalSeats_from) {
                query.totalSeats.$gte = parseInt(req.query.totalSeats_from);
            }
            if (req.query.totalSeats_to) {
                query.totalSeats.$lte = parseInt(req.query.totalSeats_to);
            }
        }

        if (req.query.totalTables_from || req.query.totalTables_to) {
            query.totalTables = {};
            if (req.query.totalTables_from) {
                query.totalTables.$gte = parseInt(req.query.totalTables_from);
            }
            if (req.query.totalTables_to) {
                query.totalTables.$lte = parseInt(req.query.totalTables_to);
            }
        }

        const page = parseInt(req.query.page) || 1; // Default to page 1
        const limit = parseInt(req.query.limit) || 10; // Default limit to 10 items
        const skip = (page - 1) * limit;

        const userEvents = await UserEvent.find(query)
            .sort({ category: 1, name: 1 }) // Sort by category and name
            .skip(skip)
            .limit(limit)
            .select("-__v"); // Exclude version key

        const totalEvents = await Event.countDocuments(query);
        const totalPages = Math.ceil(totalEvents / limit);

        return response.success(res, "All user events retrieved successfully", {
            userEvents,
            totalEvents,
            totalPages,
            currentPage: page,
        });
    } catch (error) {
        console.error(`Error getting all user events: ${error}`);
        return response.serverError(res, "Error getting all user events");
    }
};

exports.updateUserEvent = async (req, res) => {
    try {
        const { id } = req.query;

        const updatedEvent = await UserEvent.findByIdAndUpdate(id, req.body, {
            new: true,
        })

        if (!updatedEvent) {
            return response.notFound(res, "Event not found");
        }

        return response.success(res, "Event updated successfully", {
            updatedEvent,
        });
    } catch (error) {
        console.error(`Error updating event: ${error}`);
        return response.serverError(res, `Error updating event: ${error}`);
    }
};

exports.deleteUserEvent = async (req, res) => {
    try {
        const { id } = req.query;

        const deletedEvent = await UserEvent.findByIdAndDelete(id);

        if (!deletedEvent) {
            return response.notFound(res, "Event not found");
        }

        return response.success(res, "Event deleted successfully", {
            deletedEvent,
        });
    } catch (error) {
        console.error(`Error deleting event: ${error}`);
        return response.serverError(res, `Error deleting event: ${error}`);
    }
};
