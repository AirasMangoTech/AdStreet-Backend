const response = require("../utils/responseHelpers");

const Registration = require("../models/admeet"); // Replace with the path to your Mongoose model

const register = async (req, res) => {
  try {
    const { name, phoneNumber, email, companyName, industry, blogId } = req.body;
    const newRegistration = new Registration({
      name,
      phoneNumber,
      email,
      companyName,
      industry,
      blogId
    });
    await newRegistration.save();

    return response.success(res, "Registration successful", {
      newRegistration,
    });
  } catch (error) {
    return response.serverError(res, "Error in registration", error.message);
  }
};

const getAllRegistrations = async (req, res) => {
  try {
    let query = {}
    if(req.query.blogId){
      query = {blogId: req.query.blogId}
    }
    const registrations = await Registration.find(query);
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
