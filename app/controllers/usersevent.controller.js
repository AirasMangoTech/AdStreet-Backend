const { format } = require("date-fns");
const UserEvent = require("../models/usersevents");
const Event = require("../models/banner");
const Blog = require("../models/blogs");
const response = require("../utils/responseHelpers");
const { sendEventEmail, sendEmail } = require("../utils/sendEventEmail");

const getDateDetails = (dateString) => {
  if (!dateString) throw new Error("Invalid date string");
  const [day, month, year] = dateString.split("/").map(Number);

  const date = new Date(year, month - 1, day); // month is 0-indexed

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const monthsOfYear = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayName = daysOfWeek[date.getDay()];
  const monthName = monthsOfYear[date.getMonth()];
  const dateNumber = date.getDate();

  return { dayName, monthName, dateNumber, year };
};

exports.addUserEvent = async (req, res) => {
  try {
    const eventData = req.body;
    const eventName = req.query.event?.toLowerCase();

    if (!eventName) {
      return response.badRequest(res, "Event name is required.");
    }

    const event =
      (await Event.findOne({ eventName })) ||
      (await Blog.findOne({ type: eventName }));

    if (!event) {
      return response.badRequest(res, `No event named "${eventName}" exists.`);
    }

    const eventClone = { ...event.toObject() };

    if (!eventClone.eventDate) {
      eventClone.eventDate = format(new Date(event.date), "dd/MM/yyyy");
      eventClone.eventStartTime = format(
        new Date(event.additional.start_time),
        "HH:mm a"
      );
      eventClone.eventEndTime = format(
        new Date(event.additional.end_time),
        "HH:mm a"
      );
      eventClone.eventName = event.title;
      eventClone.venue = event.additional.location;
    }

    eventClone.eventDetails = getDateDetails(eventClone.eventDate);
    eventData.event = event._id;
    const userEvent = await UserEvent.create(eventData);

    const name =
      userEvent.name?.charAt(0).toUpperCase() + userEvent.name?.slice(1);

    if (userEvent.email && name) {
      await sendEventEmail(userEvent.email, name, eventClone, event.mailBody);
    } else {
      console.warn("User email or name is missing, skipping email.");
    }

    return response.success(res, "Event created successfully.", {
      event: userEvent,
    });
  } catch (error) {
    console.error(`Error creating event: ${error.message}`, error);
    return response.serverError(res, "Error creating event.");
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
      .populate("event")
      .sort({ category: 1, name: 1 }) // Sort by category and name
      .skip(skip)
      .limit(limit)
      .select("-__v"); // Exclude version key

    const totalEvents = await UserEvent.countDocuments(query);
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
    });

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

exports.mailTo = async (req, res) => {
  const { usersEmail, subject, message } = req.body;

  const mails = usersEmail.join(", ");

  try {
    await sendEmail(mails, subject, message);
    return response.success(res, "Mail to users sent successfully.");
  } catch (err) {
    console.error(`Error sending email: ${error}`);
    return response.serverError(res, `Error sending email: ${error}`);
  }
};
