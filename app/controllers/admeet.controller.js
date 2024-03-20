const response = require("../utils/responseHelpers");

const Registration = require("../models/admeet"); // Replace with the path to your Mongoose model

const register = async (req, res) => {
  try {
    const { name, phoneNumber, email, companyName, industry } = req.body;
    const newRegistration = new Registration({
      name,
      phoneNumber,
      email,
      companyName,
      industry,
    });
    await newRegistration.save();

    return response.success(res, "Registration successful", {
      newRegistration,
    });
  } catch (error) {
        console.log(error)
    return response.serverError(res, "Error in registration", error.message);
  }
};

const getAllRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find();
    return response.success(res, "Registrations fetched successfully", {
      registrations,
    });
  } catch (error) {
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
