const Users = require("../models/users");
const response = require("../utils/responseHelpers");

const dupliUser = async (req, res, next) => {
  try {

    if(!req.body.isSocialLogin)
    {
      let email = await Users.findOne({
        email: req.body.email,
      });
      if (email) {
        return response.badRequest(res, "This Email already exists");
      }
      let phone = await Users.findOne({
        phone_Number: req.body.phoneNumber,
      });
      if (phone) {
        return response.badRequest(res, "This Phone Number already exists");
      }
    }
    

    next();
  } catch (error) {
    console.error("Error in checkUserExists middleware:", error);
    return response.serverError(res, "Server error during user check");
  }
};

module.exports = dupliUser;
