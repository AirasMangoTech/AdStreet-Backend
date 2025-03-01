const User = require("../models/users");
const Wallet = require("../models/wallet");
const WithdrawRequest = require("../models/withdrawRequest");
const Notification = require("../models/notifications");
const Account = require("../models/accounts");
const sendNotification = require("../utils/sendNotifications");
const { ROLE_IDS } = require("../utils/utility");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const response = require("../utils/responseHelpers");
const logger = require("../logger");
const FcmToken = require("../models/fcmTokens");
const escrowAccount = require("../models/escrowAccount");
const PlatformFee = require("../models/platformFee");
const moment = require("moment");

const auth = require("../middleware/auth");
const {
  verifyGoogleToken,
  verifyFacebookToken,
} = require("../utils/verifyToken");
require("dotenv").config();
const mongoose = require("mongoose");

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
      isSocialLogin,
      socialLogin,
    } = req.body;

    // Validate and process inputs
    if (!email || !phoneNumber || !roles || !fcm_token) {
      return response.badRequest(
        res,
        "Email, fcmToken, and Phone Number are required"
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

    let encryptedPassword = "";
    if (password) {
      encryptedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));
    }

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
      isSocialLogin,
      socialLogin,
      user_type: "normal",
    });
    await newUser.save();

    let fcmObj = {
      user_id: newUser._id,
      //device_uid: req.headers.deviceid,
      token: req.body.fcm_token,
    };
    let fcm = new FcmToken(fcmObj);
    await fcm.save();

    const wallet = await Wallet.create({
      user: newUser._id,
    });

    // Generate JWT token
    const token = jwt.sign(
      { email: newUser.email, id: newUser._id, role_id: roleId },
      process.env.SECRET_KEY,
      { expiresIn: "30d" }
    );

    let userShallow = newUser.toJSON();
    delete userShallow.password;
    const obj = {
      ...userShallow,
      //roles: user.ROLE_IDS,
      token: token,
      //fcmToken:  user.fcmToken,
    };

    return response.success(res, "Signup Successful", { user: obj, token });
  } catch (error) {
    console.log(error.message);
    logger.error(`ip: ${req.ip}, url: ${req.url}, error: ${error.stack}`);
    return response.serverError(res, "Something bad happened! Try Again Later");
  }
};

const login = async (req, res) => {
  try {
    let { phone_Number, email, password, fcmToken } = req.body;
    phone_Number = phone_Number ? phone_Number.trim() : undefined;

    //const user = await User.findOne({ phone_Number: phone_Number });
    const user = await User.findOne({ email: email });

    if (!user) return response.notFound(res, "Invalid Credentials");
    if (await bcrypt.compare(password, user.password)) {
      // User found and password is correct, create a JWT token
      const token = jwt.sign(
        {
          name: user.name,
          phoneNumber: user.phone_Number,
          email: user.email,
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

      if (fcmToken) {
        let fcmObj = {
          user_id: user._id,
          device_uid: req.headers.deviceid,
          token: req.body.fcmToken,
        };
        let fcm = new FcmToken(fcmObj);
        await fcm.save();
      }

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

const socialLogin = async (req, res) => {
  try {
    const { socialType, id, access_token } = req.body;

    let userData;

    if (socialType === "google") {
      userData = await verifyGoogleToken(access_token);
      if (userData.sub !== id) throw new Error("Google user ID does not match");
    } else if (socialType === "facebook") {
      userData = await verifyFacebookToken(access_token, id);
      if (userData.id !== id)
        throw new Error("Facebook user ID does not match");
    } else {
      return response.badRequest(res, "Invalid social type");
    }

    // Check if the user exists
    let user = await User.findOne({ [`socialLogin.${socialType}.id`]: id });

    // If the user doesn't exist, create a new user
    if (!user) {
      return response.success(res, "Registration Required", {
        registration_required: true,
      });
    }

    // Generate JWT token for the user
    const jwt_token = jwt.sign(
      {
        name: user.name,
        phoneNumber: user.phone_Number,
        email: user.email,
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
      token: jwt_token,
      //fcmToken:  user.fcmToken,
    };

    let fcmObj = {
      user_id: user._id,
      device_uid: req.headers.deviceid,
      token: req.body.fcmToken,
    };
    let fcm = new FcmToken(fcmObj);
    await fcm.save();

    return response.success(res, "Login Successful", { user: obj });
  } catch (error) {
    console.log(error.message);
    logger.error(`ip: ${req.ip}, url: ${req.url}, error: ${error.stack}`);
    return response.serverError(res, "Something bad happened! Try Again Later");
  }
};

const logout = async (req, res) => {
  try {
    const { fcmToken, user_id } = req.body;

    const deletedToken = await FcmToken.deleteMany({
      token: fcmToken,
      user_id: user_id,
    });

    return response.success(res, "Logout Successful", {});
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
    let query = { user_type: "normal" };

    if (req.query.city) {
      query.city = { $regex: new RegExp(req.query.city, "i") };
    }
    if (req.query.name) {
      query.name = { $regex: new RegExp(req.query.name, "i") };
    }
    if (req.query.industry) {
      const industryId = new mongoose.Types.ObjectId(req.query.industry);
      query["additional.industry"] = industryId;
    }
    console.log(query);
    if (req.query.services) {
      const serviceId = new mongoose.Types.ObjectId(req.query.services);
      query["additional.services"] = serviceId;
    }
    if (req.query.phone_Number) {
      query.phone_Number = { $regex: new RegExp(req.query.phone_Number, "i") };
    }
    if (req.query.category !== undefined) {
      const categories = req.query.category.split(",");
      const categoryObjectIDs = categories.map(
        (category) => new mongoose.Types.ObjectId(category)
      );
      query.category = { $in: categoryObjectIDs };
    }
    if (req.query.role) {
      query.roles = req.query.role;
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "additional.services",
        model: "Service",
      })
      .populate({
        path: "additional.industry",
        model: "Industry",
      });

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
    console.error(`Error getting all users: ${error}`);
    return response.serverError(res, `Error getting all users: ${error}`);
  }
};

const getUser = async (req, res) => {
  try {
    const { user_id } = req.query;

    const user = await User.findById(user_id).select(
      "name email phone_Number roles about image isDelete"
    );

    if (!user) {
      return response.notFound(res, `User not found`);
    }

    return response.success(res, "User retrieved successfully", {
      user,
    });
  } catch (error) {
    console.error(`Error getting all users: ${error}`);
    return response.serverError(res, `Error getting all users: ${error}`);
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.body;

    const user = await User.findByIdAndUpdate(id, req.body, {
      new: true,
    }).select("name email phone_Number roles about image");

    if (!user) {
      return response.notFound(res, `User not found`);
    }

    return response.success(res, "User retrieved successfully", {
      user,
    });
  } catch (error) {
    console.error(`Error getting user: ${error}`);
    return response.serverError(res, `Error getting user: ${error}`);
  }
};

const getWalletHistory = async (req, res) => {
  try {
    const { user_id } = req.query;

    // Fetch wallet history
    const [statements, wallet] = await Promise.all([
      escrowAccount
        .find({ user: user_id })
        .select("user amount job description type createdAt adId")
        .populate({
          path: "adId",
          select: "title description budget hired_user postedBy isCompleted",
          populate: [
            { path: "hired_user", select: "name email" },
            { path: "postedBy", select: "name email" },
          ],
        })
        .exec(),
      Wallet.findOne({ user: user_id }),
    ]);

    if (!wallet) {
      return response.badRequest(res, "No wallet found for that user ID.");
    }

    // Transform the fetched data
    const transformedHistory = statements
      .map((transaction) => ({
        amount: transaction.amount,
        narration: transaction.description,
        type: transaction.type,
        transaction_date: transaction.createdAt,
        ad: transaction.adId,
      }))
      .sort(
        (a, b) => new Date(b.transaction_date) - new Date(a.transaction_date)
      );

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const paginatedHistory = transformedHistory.slice(skip, skip + limit);
    const totalTransactions = transformedHistory.length;
    const totalPages = Math.ceil(totalTransactions / limit);
    const pagination = {
      totalTransactions,
      totalPages,
      currentPage: page,
      limit,
    };

    const message = "Wallet History loaded successfully";

    return response.success(res, message, {
      balance: wallet.amount,
      transactionHistory: paginatedHistory,
      pagination,
    });
  } catch (error) {
    console.log(error);
    return response.serverError(
      res,
      error.message,
      "Failed to update withdraw request"
    );
  }
};

const createWithdrawRequest = async (req, res) => {
  try {
    const requestObj = req.body;
    requestObj.user = req.user.id;

    const wallet = await Wallet.findOne({ user: req.user.id });
    const account = await Account.findById(req.body.account);
    if (wallet.amount < requestObj.amount) {
      return response.badRequest(res, "Insufficient funds.");
    }

    if (!account) {
      return response.badRequest(res, "No such account.");
    }

    const percent = (await PlatformFee.findOne()).fee;
    const requestedAmount = requestObj.amount;
    const platformFee = (requestedAmount * percent) / 100;
    requestObj.amount -= platformFee;
    requestObj.platformFee = platformFee;

    const request = new WithdrawRequest(requestObj);
    await request.save();

    const message = "Withdraw request generate successfully.";

    return response.success(res, message, { request });
  } catch (error) {
    console.log(error);
    return response.serverError(
      res,
      error.message,
      "Failed to load Payment Method"
    );
  }
};

const updateWithdrawRequest = async (req, res) => {
  try {
    if (req.user.role_id !== ROLE_IDS.ADMIN) {
      return response.forbidden(
        res,
        "You don't have permission to perform this action"
      );
    }

    const request = await WithdrawRequest.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );

    if (!request) {
      return response.notFound(
        res,
        `No request was found with the id of ${req.params.id}`
      );
    }

    if (!request.isWithdrawed) {
      if (!req.body.rejectReason) {
        let userWallet = await Wallet.findOne({ user: request.user });
        const admin = await User.findOne({ roles: ROLE_IDS.ADMIN });
        const adminWallet = await Wallet.findOne({ user: admin._id });
        const amountToBeDeducted = request.amount + request.platformFee;

        if (userWallet.amount < amountToBeDeducted) {
          return response.badRequest(
            res,
            "Cannot withdraw, user does not have sufficient funds."
          );
        }

        userWallet.amount -= amountToBeDeducted;
        await userWallet.save();
        adminWallet.amount += request.platformFee;
        await adminWallet.save();

        await escrowAccount.create({
          user: request.user,
          amount: amountToBeDeducted,
          description: "Amount withdrawed from account.",
          type: "withdraw",
        });

        await escrowAccount.create({
          user: admin._id,
          amount: request.platformFee,
          description: `Amount of ${request.platformFee}Rs credited to your wallet of platform fees.`,
          type: "credit",
        });

        request.isWithdrawed = true;
        await request.save();

        const notificationTitle = `Funds withdrawed`;
        const notificationDescription = `Amount of ${amountToBeDeducted}PKR has been debitted from your account.`;

        const notificationData = {
          id: request._id,
          pagename: "wallet",
          title: notificationTitle,
          body: notificationDescription,
        };

        const notification = new Notification({
          title: notificationTitle,
          content: notificationDescription,
          icon: "check-box",
          data: JSON.stringify(notificationData),
          user_id: request.user,
        });
        await notification.save();

        const fcmTokens = await FcmToken.find({ user_id: request.user });
        const tokenList = fcmTokens.map((tokenDoc) => tokenDoc.token);

        if (tokenList.length > 0) {
          for (const token of tokenList) {
            await sendNotification(
              notificationTitle,
              notificationDescription,
              notificationData,
              token
            );
          }
        } else {
          console.warn(
            "No FCM tokens found for the employer. Notification not sent."
          );
        }

        return response.success(res, "Withdraw request updated successfully.", {
          request,
        });
      } else {
        const notificationTitle = `Withdraw request rejected`;
        const notificationDescription = `Your withdraw request of amount ${
          request.amount + request.platformFee
        }Rs has been rejected due to the following reason provided by administration: ${
          request.rejectReason
        }. Please contact at support@adstreet.com.pk for more details`;

        const notificationData = {
          id: request._id,
          pagename: "job-details",
          title: notificationTitle,
          body: notificationDescription,
        };

        const notification = new Notification({
          title: notificationTitle,
          content: notificationDescription,
          icon: "check-box",
          data: JSON.stringify(notificationData),
          user_id: request.user,
        });
        await notification.save();

        const fcmTokens = await FcmToken.find({ user_id: request.user });
        const tokenList = fcmTokens.map((tokenDoc) => tokenDoc.token);

        if (tokenList.length > 0) {
          for (const token of tokenList) {
            await sendNotification(
              notificationTitle,
              notificationDescription,
              notificationData,
              token
            );
          }
        } else {
          console.warn(
            "No FCM tokens found for the employer. Notification not sent."
          );
        }

        response.success(res, "Request rejected", {
          reason: request.rejectReason,
        });
      }
    } else {
      response.badRequest(res, "Request is already withdrawn.");
    }
  } catch (error) {
    console.log(error);
    return response.serverError(
      res,
      error.message,
      "Failed to load Payment Method"
    );
  }
};

const getWithdrawRequest = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query = { name: { $regex: new RegExp(search, "i") } };
    }

    if (req.user.role_id !== ROLE_IDS.ADMIN) {
      query.user = new mongoose.Types.ObjectId(req.user.id);
    } else {
      if (req.query.user_id) {
        query.user = new mongoose.Types.ObjectId(req.query.user_id);
      }
    }

    const getStartOfDay = (date) => {
      return moment(date).startOf("day").toDate();
    };
    const getEndOfDay = (date) => {
      return moment(date).endOf("day").toDate();
    };
    if (req.query.from && req.query.to) {
      query.createdAt = {
        $gte: getStartOfDay(new Date(req.query.from)),
        $lte: getEndOfDay(new Date(req.query.to)),
      };
    } else if (req.query.from) {
      query.createdAt = {
        $gte: getStartOfDay(new Date(req.query.from)),
      };
    } else if (req.query.to) {
      query.createdAt = {
        $lte: getEndOfDay(new Date(req.query.to)),
      };
    }

    const page = parseInt(req.query.page) || 1; // Default to page 1 if not specified
    const limit = parseInt(req.query.limit) || 10; // Default limit to 10 items per page
    const skipIndex = (page - 1) * limit;

    const requests = await WithdrawRequest.find(query)
      .populate("user")
      .populate("account")
      .sort({ createdAt: -1 })
      .skip(skipIndex)
      .limit(limit);

    const totalrequests = await WithdrawRequest.countDocuments(query);
    const totalPages = Math.ceil(totalrequests / limit);
    // Use a consistent structure for the response
    const message = "Withdraw requests loaded successfully";
    return response.success(res, message, {
      requests,
      totalPages,
      currentPage: page,
      totalrequests,
    });
  } catch (error) {
    console.log(error);
    return response.serverError(
      res,
      error.message,
      "Failed to load Categories"
    );
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.query.id;

    if (!userId) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid user id",
      });
    }

    const user = await User.findByIdAndUpdate(userId, { isDelete: true });

    if (!user) {
      return res.status(400).json({
        status: "fail",
        message: "No user found with that ID.",
      });
    }

    response.success(res, "User deleted successfully");
  } catch (error) {
    console.error(`Error deleting user: ${error}`);
    return response.serverError(res, "Something bad happened! Try Again Later");
  }
};

module.exports = {
  signup,
  login,
  socialLogin,
  logout,
  getAllUsers,
  getWalletHistory,
  getUser,
  updateUser,
  createWithdrawRequest,
  updateWithdrawRequest,
  getWithdrawRequest,
  deleteUser,
};
