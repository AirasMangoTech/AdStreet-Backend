const crypto = require('crypto');
const response = require("../utils/responseHelpers");
const User = require("../models/users"); // Replace with the path to your Mongoose model
const Registration = require("../models/admeet");
const Interest = require("../models/interest") // Replace with the path to your Mongoose model

const register = async (req, res) => {
  try {
    const { name, phoneNumber, email, companyName, expressedInterest, industry, blogId } = req.body;
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

    // const interest = new Interest({
    //   blog: req.body.blogId,
    //   user: newRegistration._id,
    //   expressedInterest: req.body.expressedInterest
    // });
    // await interest.save()
   
  
    return response.success(res, "Registration successful", {
      newRegistration,
      interest,
    });
  } catch (error) {
    console.log(error)
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
