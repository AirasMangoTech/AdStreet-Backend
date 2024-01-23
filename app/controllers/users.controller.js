const User = require("../models/users");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const response = require("../utils/responseHelpers");
const logger = require("../logger");
require("dotenv").config();

const signup = async (req, res) => {
  try {
    let { email, password, confirmPassword, phoneNumber } = req.body;

    // Validate and process inputs
    if (!email || !password || !confirmPassword || !phoneNumber) {
      return response.badRequest(
        res,
        "Email, Password, Confirm Password, and Phone Number are required"
      );
    }

    // Check if password and confirm password match
    if (password !== confirmPassword) {
      return response.badRequest(res, "Passwords do not match");
    }

    email = email.trim();
    phoneNumber = phoneNumber.trim();

    // Check for existing user by email or phone number
    const existingUser = await User.findOne({
      $or: [{ email: email }, { phone_Number: phoneNumber }],
    });
    if (existingUser) {
      return response.conflict(
        res,
        "User with given email or phone number already exists"
      );
    }

    // Encrypt the password
    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      email: email,
      password: encryptedPassword,
      phone_Number: phoneNumber,
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { email: newUser.email, id: newUser._id },
      process.env.SECRET_KEY,
      { expiresIn: "1d" }
    );

    let obj = {
      email: newUser.email,
      phone_Number: newUser.phone_Number,
      token: token,
    };

    return response.success(res, "Signup Successful", obj);
  } catch (error) {
    console.log(error);
    logger.error(`ip: ${req.ip}, url: ${req.url}, error: ${error.stack}`);
    return response.serverError(res, "Something bad happened! Try Again Later");
  }
};

const login = async (req, res) => {
  try {
    let { phoneNumber, password } = req.body;
    phoneNumber = phoneNumber ? phoneNumber.trim() : undefined;

    // Find the user by phone number
    const user = await User.findOne({ phone_Number: phoneNumber });
    console.log(user)
    console.log(phoneNumber)

    if (!user) return response.notFound(res, "Invalid Credentials");

    // Compare the provided password with the stored hashed password
    if (await bcrypt.compare(password, user.password)) {
      // User found and password is correct, create a JWT token
      const token = jwt.sign(
        { name: user.name, phoneNumber: user.phoneNumber, id: user._id },
        process.env.SECRET_KEY,
        {
          expiresIn: "1d",
        }
      );

      // Create object to send as response
      const obj = {
        name: user.name,
        phoneNumber: user.phoneNumber,
        token: token,
      };

      // Return success response
      return response.success(res, "Login Successful", obj);
    } else {
      // Passwords do not match
      return response.notFound(res, "Invalid Credentials");
    }
  } catch (error) {
    // Log the error and return a server error response
    console.log(error);
    logger.error(`ip: ${req.ip},url: ${req.url},error:${error.stack}`);
    return response.serverError(res, "Something bad happened! Try Again Later");
  }
};
module.exports = {
  signup,
  login,
};
