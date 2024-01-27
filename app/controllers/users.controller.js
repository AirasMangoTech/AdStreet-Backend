const User = require("../models/users");
const {ROLE_IDS} = require("../utils/utility");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const response = require("../utils/responseHelpers");
const logger = require("../logger");
require("dotenv").config();

const signup = async (req, res) => {
  try {
    let { email, password, confirmPassword, phoneNumber, roles } = req.body;

    // Validate and process inputs
    if (!email || !password || !confirmPassword || !phoneNumber || !roles) {
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
      return response.badRequest(
        res,
        "User with given email or phone number already exists"
      );
    }
    var roleId;
    console.log(roles);
    switch (roles) {
      case "Brand Company":
        roleId = ROLE_IDS.BRAND_COMPANY;
        break;
      case "Agency":
        roleId = ROLE_IDS.AGENCY;
        console.log("i am woking");
        break;
      case "Individual":
        roleId = ROLE_IDS.INDIVIDUAL;
        break;
      case "Admin":
        roleId = ROLE_IDS.ADMIN;
        break;
      default:
        return response.badRequest(res, "Invalid role name");
    }

    // Encrypt the password and create new user
    const encryptedPassword = await bcrypt.hash(
      password,
      await bcrypt.genSalt(10)
    );
    console.log(roleId);
    const newUser = new User({
      email,
      password: encryptedPassword,
      roles: roleId, // Save the role ID
      phone_Number: phoneNumber,
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { email: newUser.email, id: newUser._id, role_id: roleId },
      process.env.SECRET_KEY,
      { expiresIn: "1d" }
    );

    const obj = {
      email: newUser.email,
      phone_Number: newUser.phone_Number,
      token: token,
    };
    
    return response.success(res, "Signup Successful", obj);
  } catch (error) {
    console.log(error.message);
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
    
    if (!user) return response.notFound(res, "Invalid Credentials");

    // Compare the provided password with the stored hashed password
    if (await bcrypt.compare(password, user.password)) {
      // User found and password is correct, create a JWT token
      const token = jwt.sign({ 
        name: user.name, 
        phoneNumber: user.phoneNumber, 
        id: user._id,
        role_id: user.roles
      },process.env.SECRET_KEY,
        {
          expiresIn: "1d",
        }
      );
      res.json({ token });
      // Create object to send as response
      const obj = {
        name: user.name,
        phoneNumber: user.phoneNumber,
        role_id: user.role_id,
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

const retrieveDataForRole = async (req, res) => {
  try {
    const user = await User.findById(req.user._id); 

    let data;
    switch (user.role) {
      case ROLE_IDS.BRAND_COMPANY:
        data = await BrandCompany.findOne({ _id: user.companyId });
        data = await getBrandCompanyData(user);
        console.log(BRAND_COMPANY);
        break;
      case ROLE_IDS.AGENCY:
        // Fetch data specific to agencies
        data = await getAgencyData(user);
        console.log(AGENCY);
        break;
      case ROLE_IDS.INDIVIDUAL:
        // Fetch data specific to individuals
        data = await getIndividualData(user);
        console.log(INDIVIDUAL);
        break;
      default:
        throw new Error("Unknown role");
    }

    res.json(data);
  } catch (error) {
    console.error(`Error retrieving data for role: ${error}`);
    res.status(500).json({ message: "Error retrieving data" });
  }
};

module.exports = {
  signup,
  login,
  retrieveDataForRole,
};
