const crypto = require('crypto');
const response = require("../utils/responseHelpers");
const User = require("../models/users"); 
const Registration = require("../models/admeet");
const Interest = require("../models/interest") 

const register = async (req, res) => {
  try {
    const { name, phoneNumber, email, companyName, expressedInterest, industry, blogId } = req.body;

    let existingUser = await User.findOne({ email });

    if (!existingUser) {
      const password = crypto.randomBytes(6).toString('hex');
      const newRegistration = new User({
        name,
        phoneNumber,
        email,
        password,
        companyName,
        industry,
        blogId,
        roles: "Individual",
        expressedInterest
      });
      await newRegistration.save();
      existingUser = newRegistration;
    }

    let existingInterest = await Interest.findOne({ blog: blogId, user: existingUser._id });

    if (existingInterest) {
      return response.badRequest(res, "User has already shown interest in this blog");
    }

    const newInterest = new Interest({
      blog: blogId,
      user: existingUser._id,
      expressedInterest
    });
    await newInterest.save();

    return response.success(res, "Registration and interest recorded successfully", {
      user: existingUser,
      interest: newInterest
    });
  } catch (error) {
    console.error(error);
    return response.serverError(res, "Error in registration and interest recording", error.message);
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
