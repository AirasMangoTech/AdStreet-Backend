const User = require("../models/users");
const response = require("../utils/responseHelpers");

const dupliUser = async (req, res, next) => {
  try {
    let email = await User.findOne({
      email: req.body.email,
    });
    if (email) {
      return helperFunction.badRequest(res, "This Email already exists");
    }
    let phone = await User.findOne({
      phone: req.body.phone,
    });
    if (phone) {
      return helperFunction.badRequest(res, "This Phone Number already exists");
    }
    if (req.body.validate == true) {
      return helperFunction.success(res, "Email/Phone is Valid");
    }

    next(); // No existing user found, proceed to the next middleware
  } catch (error) {
    console.error("Error in checkUserExists middleware:", error);
    return response.serverError(res, "Server error during user check");
  }
};

module.exports = dupliUser;
