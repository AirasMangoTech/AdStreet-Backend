const User = require("../models/users");
const response = require("../utils/responseHelpers");

const dupliUser = async (req, res, next) => {
  try {
    let email = await User.findOne({
      email: req.body.email,
    });
    if (email) {
      return response.badRequest(res, "This Email already exists");
    }
    let phone = await User.findOne({
      phone_Number: req.body.phoneNumber,
    });
    if (phone) {
      return response.badRequest(res, "This Phone Number already exists");
    }

    next();
  } catch (error) {
    console.error("Error in checkUserExists middleware:", error);
    return response.serverError(res, "Server error during user check");
  }
};

module.exports = dupliUser;
