const User = require("../models/users");
const { ROLE_IDS } = require("../utils/utility");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const response = require("../utils/responseHelpers");
const logger = require("../logger");
const FcmToken = require("../models/fcmTokens");
const auth = require("../middleware/auth");
require("dotenv").config();

const signup = async (req, res) => {
  try {
    let {
      name,
      email,
      password,
      phoneNumber,
      roles,
      fcm_token,
      image,
      country,
      city,
      state,
      additional,
    } = req.body;

    // Validate and process inputs
    if (!email || !password || !phoneNumber || !roles || !fcm_token) {
      return response.badRequest(
        res,
        "Email, Password, fcmToken, and Phone Number are required"
      );
    }

    email = email.toLowerCase().trim();
    phoneNumber = phoneNumber.trim();

    var roleId;
    console.log(roles);
    switch (roles) {
      case "Brand Company":
        roleId = ROLE_IDS.BRAND_COMPANY;
        break;
      case "Agency":
        roleId = ROLE_IDS.AGENCY;
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
    console.log(additional);

    const newUser = new User({
      name,
      email,
      password: encryptedPassword,
      roles: roleId, // Save the role ID
      phone_Number: phoneNumber,
      image: image ? image : null,
      country: country ? country : null,
      city: city ? city : null,
      state: state ? state : null,
      additional: additional ? additional : null,
    });
    await newUser.save();

    let fcmObj = {
      user_id: newUser._id,
      //device_uid: req.headers.deviceid,
      token: req.body.fcm_token,
    };
    let fcm = new FcmToken(fcmObj);
    await fcm.save();

    // Generate JWT token
    const token = jwt.sign(
      { email: newUser.email, id: newUser._id, role_id: roleId },
      process.env.SECRET_KEY,
      { expiresIn: "1d" }
    );

    return response.success(res, "Signup Successful", { user: newUser, token });
  } catch (error) {
    console.log(error.message);
    logger.error(`ip: ${req.ip}, url: ${req.url}, error: ${error.stack}`);
    return response.serverError(res, "Something bad happened! Try Again Later");
  }
};

const login = async (req, res) => {
  try {
    let { phoneNumber, password, fcmToken } = req.body;
    phoneNumber = phoneNumber ? phoneNumber.trim() : undefined;

    const user = await User.findOne({ phone_Number: phoneNumber });

    if (!user) return response.notFound(res, "Invalid Credentials");
    if (await bcrypt.compare(password, user.password)) {
      // User found and password is correct, create a JWT token
      const token = jwt.sign(
        {
          name: user.name,
          phoneNumber: user.phoneNumber,
          id: user._id,
          role_id: user.roles,
        },
        process.env.SECRET_KEY
      );
      //res.json({ token });
      // Create object to send as response
      let userShallow = user.toJSON();
      delete userShallow.password;
      const obj = {
        ...userShallow,
        //roles: user.ROLE_IDS,
        token: token,
        //fcmToken:  user.fcmToken,
      };
      console.log(obj);
      let fcmObj = {
        user_id: user._id,
        device_uid: req.headers.deviceid,
        token: req.body.fcmToken,
      };
      let fcm = new FcmToken(fcmObj);
      await fcm.save();

      // Return success response
      return response.success(res, "Login Successful", { user: obj });
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

// const retrieveDataForRole = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);

//     let data;
//     switch (user.role) {
//       case ROLE_IDS.BRAND_COMPANY:
//         data = await BrandCompany.findOne({ _id: user.companyId });
//         data = await getBrandCompanyData(user);
//         console.log(BRAND_COMPANY);
//         break;
//       case ROLE_IDS.AGENCY:
//         // Fetch data specific to agencies
//         data = await getAgencyData(user);
//         console.log(AGENCY);
//         break;
//       case ROLE_IDS.INDIVIDUAL:
//         // Fetch data specific to individuals
//         data = await getIndividualData(user);
//         console.log(INDIVIDUAL);
//         break;
//       default:
//         throw new Error("Unknown role");
//     }

//     res.json(data);
//   } catch (error) {
//     console.error(`Error retrieving data for role: ${error}`);
//     res.status(500).json({ message: "Error retrieving data" });
//   }
// };

// controllers/userController.js

// const getAllUsers = async (req, res) => {
//   try {
//     let query = {};
//     if (req.query.city) {
//       query.city = { $regex: new RegExp(req.query.city, "i") };
//     }
//     const users = await User.find({}); // Retrieves all users
//     res.json(users);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to load users' });
//   }
// };

const getAllUsers = async (req, res) => {
  try {
    let query = {};
    if (req.query.city) {
      query.city = { $regex: new RegExp(req.query.city, "i") };
    }
    if (req.query.name) {
      query.name = { $regex: new RegExp(req.query.name, "i") };
    }
    if (req.query.industry) {
      query["additional.industry"] = {
        $regex: new RegExp(req.query.industry, "i"),
      };
    }
    if (req.query.services) {
      query["additional.services"] = {
        $regex: new RegExp(req.query.services, "i"),
      };
    }
    if (req.query.category !== undefined) {
      const categories = req.query.category.split(",");
      const categoryObjectIDs = categories.map(
        (category) => new mongoose.Types.ObjectId(category)
      );
      query.category = { $in: categoryObjectIDs };
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find(query).skip(skip).limit(limit);
    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);
    const pagination = {
      totalUsers,
      totalPages,
      currentPage: page,
      limit,
    };
    // Retrieve users based on query
    return response.success(res, "All users retrieved successfully", {
      users,
      pagination,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to load users" });
  }
};

module.exports = {
  signup,
  login,
  getAllUsers,
};
