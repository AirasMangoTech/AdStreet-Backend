const { format } = require("date-fns");
const crypto = require("crypto");
const response = require("../utils/responseHelpers");
const User = require("../models/users");
const Registration = require("../models/admeet");
const Interest = require("../models/interest");
const Blog = require("../models/blogs");
const { sendEventEmail } = require("../utils/sendEventEmail");

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

const register = async (req, res) => {
  try {
    const {
      name,
      phoneNumber,
      email,
      companyName,
      expressedInterest,
      industry,
      blogId,
    } = req.body;

    let existingUser = await User.findOne({ email });

    if (!existingUser) {
      const password = crypto.randomBytes(6).toString("hex");
      const newRegistration = new User({
        name,
        phone_Number: phoneNumber,
        email,
        password,
        companyName,
        industry,
        blogId,
        roles: "Individual",
        user_type: "admeet",
        expressedInterest,
      });
      await newRegistration.save();
      existingUser = newRegistration;
    }

    let existingInterest = await Interest.findOne({
      blog: blogId,
      user: existingUser._id,
    });

    if (existingInterest) {
      return response.badRequest(
        res,
        "User has already shown interest in this blog"
      );
    }

    const event = await Blog.findById(blogId);

    const eventClone = { ...event.toObject() };

    if (!eventClone.eventDate) {
      eventClone.eventDate = format(new Date(event.date), "dd/MM/yyyy");
      eventClone.eventName = event.title;
      eventClone.venue = event.additional.location;
    }

    eventClone.eventDetails = getDateDetails(eventClone.eventDate);

    var resp = await sendEventEmail(email, name, eventClone, event.mailBody);

    const newInterest = new Interest({
      blog: blogId,
      user: existingUser._id,
      expressedInterest,
    });
    await newInterest.save();

    return response.success(
      res,
      "Registration and interest recorded successfully",
      {
        user: existingUser,
        interest: newInterest,
      }
    );
  } catch (error) {
    console.error(error);
    return response.serverError(
      res,
      "Error in registration and interest recording",
      error.message
    );
  }
};

const getAllRegistrations = async (req, res) => {
  try {
    let query = {};
    if (req.query.blogId) {
      query = { blog: req.query.blogId };
    }
    //const registrations = await Registration.find(query);
    const registrations = await Interest.find(query).populate({
      path: "user",
      select: "name email phone_Number",
    });
    return response.success(res, "Registrations fetched successfully", {
      registrations,
    });
  } catch (error) {
    console.log("🚀 ~ getAllRegistrations ~ error:", error);

    return response.serverError(
      res,
      "Error fetching registrations",
      error.message
    );
  }
};

module.exports = {
  register,
  getAllRegistrations,
};
