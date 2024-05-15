const Ad = require("../models/ad");
const Proposal = require("../models/proposals");
const Notification = require("../models/notifications");
const AdResponse = require("../models/responseAd");
const Users = require("../models/users");
const sendNotification = require("../utils/sendNotifications");
const FcmToken = require("../models/fcmTokens");
const response = require("../utils/responseHelpers");
const { ROLE_IDS } = require("../utils/utility");
const mongoose = require("mongoose");
const moment = require("moment");

const postAd = async (req, res) => {
  if (!req.user) {
    return response.forbidden(res, "User not authenticated", user);
  }
  const user = await Users.findById(req.user.id);
  if (
    !user ||
    (req.user.role_id !== ROLE_IDS.BRAND_COMPANY &&
      req.user.role_id !== ROLE_IDS.AGENCY)
  ) {
    return response.forbidden(
      res,
      "Only users with the role of company or agency can post Ads",
      403
    );
  }
  try {
    const {
      title,
      category,
      description,
      budget,
      jobDuration,
      imageUrl,
      links,
      valid_till,
      featured,
    } = req.body;
    //const image = req.file.path; // Assuming file paths are sent from the frontend and you're using a middleware like multer for file handling

    const newAd = new Ad({
      title,
      category,
      image: req.body.imageUrl,
      links,
      description,
      budget,
      jobDuration,
      postedBy: req.user.id,
      valid_till,
      featured,
    });

    await newAd.save();
    let notiData = {};
    let notification = new Notification({
      title: `Thank you for posting for Ad`,
      content: `Thank you for posting for Ad, Your request willbe soon approved by the Admin`,
      icon: "check-box",
      data: JSON.stringify(notiData),
      user_id: postedBy,
    });
    await notification.save();
    let notiTokens = await FcmToken.find({ user_id: postedBy });
    for (let i = 0; i < notiTokens.length; i++) {
      //const token = notiTokens[0];

     let token = "f52kNgseRxmvAJmqluDkXd:APA91bEJllxd4DEFIZlilK9KjVp4Qk1i0rEHVLiEFtpKuL1dyPqOkoE6w24e0qCR6c1PUU9KQJfQH4ajTFE34p0PUNO9dr2HQ4ImupebmJr9944xQpXntJNUobHiMDe_oWhA69ETbmro"
      await sendNotification(
        `You've received a new notification "${req.body.name}"`,
        notiData,
        token.token
      );
    }
    return response.success(res, "Ad posted successfully", { newAd });
  } catch (error) {
    console.error(`Error posting ad: ${error}`);
    return response.serverError(res, "Error posting ad");
  }
};

const getAllAds = async (req, res) => {

  try {
    let query = { isApproved: true, isHired: false, isCompleted: false };

    if (req.query.title) {
      query.title = { $regex: new RegExp(req.query.title, "i") };
    }

    if (req.query.user_id) {
      query.postedBy = new mongoose.Types.ObjectId(req.query.user_id);
      delete query.isHired;
      delete query.isCompleted;
    }
    if (req.query.adId) {
      query._id = new mongoose.Types.ObjectId(req.query.adId);
    }
    if (req.query.category !== undefined) {
      const categories = req.query.category.split(",");
      const categoryObjectIDs = categories.map(
        (category) => new mongoose.Types.ObjectId(category)
      );
      query.category = { $in: categoryObjectIDs };
    }
    const getStartOfDay = (date) => {
      return moment(date).startOf("day").toDate();
    };
    const getEndOfDay = (date) => {
      return moment(date).endOf("day").toDate();
    };
    if (req.query.valid_till_from && req.query.valid_till_to) {
      query.valid_till = {
        $gte: getStartOfDay(new Date(req.query.valid_till_from)),
        $lte: getEndOfDay(new Date(req.query.valid_till_to)),
      };
    } else if (req.query.valid_till_from) {
      query.valid_till = {
        $gte: getStartOfDay(new Date(req.query.valid_till_from)),
      };
    } else if (req.query.valid_till_to) {
      query.valid_till = {
        $lte: getEndOfDay(new Date(req.query.valid_till_to)),
      };
    }
    // Date range for createdAt
    if (req.query.created_at_from && req.query.created_at_to) {
      query.createdAt = {
        $gte: getStartOfDay(new Date(req.query.created_at_from)),
        $lte: getEndOfDay(new Date(req.query.created_at_to)),
      };
    } else if (req.query.created_at_from) {
      query.created_at = {
        $gte: getStartOfDay(new Date(req.query.created_at_from)),
      };
    } else if (req.query.created_at_to) {
      query.created_at = {
        $lte: getEndOfDay(new Date(req.query.created_at_to)),
      };
    }

    let userLookupPipeline = [
      {
        $match: {
          $expr: {
            $eq: ["$_id", "$$postedBy"],
          },
        },
      },
      {
        $project: {
          password: 0, // Exclude the password field
        },
      },
    ];
    if (req.query.role) {
      userLookupPipeline.unshift({
        $match: {
          roles: req.query.role, // Assumes roles field exists and contains the role
        },
      });
    }

    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default limit to 10 items
    const skip = (page - 1) * limit;

    const ads = await Ad.aggregate([
      {
        $match: query,
      },
      {
        $lookup: {
          from: "proposals",
          localField: "_id",
          foreignField: "adId",
          as: "proposals",
        },
      },
      {
        $lookup: {
          from: "users",
          let: { postedBy: "$postedBy" },
          pipeline: userLookupPipeline,
          as: "postedBy",
        },
      },
      {
        $lookup: {
          from: "categories", // Assuming the collection name is "categories" for categories data
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          category: 1,
          links: 1,
          description: 1,
          budget: 1,
          jobDuration: 1,
          postedBy: { $arrayElemAt: ["$postedBy", 0] }, // unwind postedBy array if necessary
          createdAt: 1,
          image: 1,
          featured: 1,
          isApproved: 1,
          isHired: 1,
          isCompleted: 1,
          valid_till: 1,
          totalProposals: { $size: "$proposals" },
        },
      },
      { $sort: {  featured: -1, createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    const totalAds = await Ad.countDocuments(query);
    const totalPages = Math.ceil(totalAds / limit);

    return response.success(res, "All ads retrieved successfully", {
      ads,
      totalAds,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error(`Error getting all ads: ${error}`);
    return response.serverError(res, "Error getting all ads");
  }
};
// chnages user applied status to true or false
const GetAdddetails = async (req, res) => {
  try {
    let where = {};
    if (req.query.adId) {
      where._id = new mongoose.Types.ObjectId(req.query.adId);
    }
    const adDetails = await Ad.findOne(where)
      .populate("category")
      .populate("postedBy", "_id name email");

    if (!adDetails) {
      return response.notFound(res, "Ad not found");
    }
    const proposalCount = await Proposal.countDocuments({ adId: adDetails._id });

    const userId = new mongoose.Types.ObjectId(req.user.id);
    const proposal = await Proposal.findOne({
      submittedBy: userId,
      adId: adDetails._id,
    });
    
    console.log(proposal);
    // Check if the user has already applied for this proposal
    let userApplied = false;
    if (proposal) {
      userApplied = true;
    }
    // Update ad details to include the 'applied' flag
    const adDetailsWithAppliedFlag = {
      ...{ adDetails },
      applied: userApplied,
      proposalCount: proposalCount, 
    };
    return response.success(res, "Ad details retrieved successfully", {
      adDetails: adDetailsWithAppliedFlag,
    });
  } catch (error) {
    console.error(`Error getting ad details: ${error}`);
    return response.serverError(res, "Error getting ad details");
  }
};
// chngaes the status of the proposal to true /false after hiring
const acceptProposal = async (req, res) => {
  try {
    const { adId, proposalId, token } = req.body;

    const ad = await Ad.findById(adId);
    if (!ad) {
      return response.notFound(res, "Ad not found");
    }

    if (ad.postedBy.toString() !== req.user.id) {
      return response.authError(
        res,
        "Only the creator of the ad can accept proposals"
      );
    }
    if (ad.hired_user) {
      return response.badRequest(
        res,
        "Another proposal cannot be accepted as the ad already has a hired user"
      );
    }

    const proposalToAccept = await Proposal.findByIdAndUpdate(
      proposalId,
      { status: "true" },
      { new: true }
    ).populate("submittedBy", "_id");

    if (!proposalToAccept) {
      return response.notFound(res, "Proposal not found");
    }
    ad.hired_user = proposalToAccept.submittedBy;
    ad.isHired = true;
    await ad.save();

    notiTitle = `${req.user.name} has acceptd your proposal`;
    notiDescription = `Your contract with ${req.user.name} has started`;
    notificationObj = {
      title: notiTitle,
    };

    let notiData = {
      type: "Accepted",
      adId: adId,
      fromUser: req.user._id,
      toUser: proposalToAccept.submittedBy._id,
      description: notiDescription,
    };

    let notification = new Notification({
      title: notiTitle,
      content: notiDescription,
      type: "Accepted",
      data: JSON.stringify(notiData),
      user_id: proposalToAccept.submittedBy._id,
    });

    await notification.save();
    let notiToken = await FcmToken.find({ user_id: proposalToAccept.submittedBy._id });
    if (notiToken.length > 0) {
      const token = notiToken[0];
      await sendNotification(notiTitle, notiDescription, notiData, token.token);
    }
    

    return response.success(res, "Proposal accepted successfully", {
      proposalToAccept,
      hired_user: ad.hired_user,
    });
  } catch (error) {
    console.error(`Error accepting proposal: ${error}`);
    return response.serverError(res, "Error accepting proposal");
  }
};

const getHiredUsersAndAds = async (req, res) => {
  try {
    const userId = req.user.id;

    const ongoingAds = await Ad.find({
      postedBy: userId,
      hired_user: { $exists: true, $ne: null },
      isCompleted: false,
    })
      .populate("hired_user", "-password")
      .populate("category")
      .populate("postedBy", "_id");

    // Find completed ads posted by the current user
    const completedAds = await Ad.find({
      postedBy: userId,
      isCompleted: true,
    })
      .populate("hired_user", "-password")
      .populate("category")
      .populate("postedBy", "_id");

    const ongoingHIREDAds = await Ad.find({
      hired_user: userId,
      //hired_user: { $exists: true, $ne: null },
      isCompleted: false,
    })
      .populate("hired_user", "-password")
      .populate("category")
      .populate("postedBy", "_id");

    // Find completed ads posted by the current user
    const completedHIREDAds = await Ad.find({
      hired_user: userId,
      isCompleted: true,
    })
      .populate("hired_user", "-password")
      .populate("category")
      .populate("postedBy", "_id");

    const hiredUser = await Proposal.find({
      submittedBy: userId,
      status: "true",
      isCompleted: false,
    }).populate("postedBy", "name");

    // Check if any ads are found
    // if (
    //   (!ongoingAds || ongoingAds.length === 0) &&
    //   (!completedAds || completedAds.length === 0)
    // ) {
    //   return response.notFound(res, "No ads found for the user");
    // }

    // Extract hired users from all ongoing ads
    // const hiredUsers = ongoingAds.reduce((users, ad) => {
    //   if (ad.submittedBy) {
    //     users.push(ad.submittedBy);
    //   }
    //   return users;
    // }, []);

    return response.success(res, "Hired users and ads retrieved successfully", {
      ongoingAds,
      completedAds,
      hiredUser,
      ongoingHIREDAds,
      completedHIREDAds,
    });
  } catch (error) {
    console.error(`Error getting hired users and ads: ${error}`);
    return response.serverError(res, "Error getting hired users and ads");
  }
};
const getHiredUser = async (req, res) => {
  try {
    const { userId } = req.user;

    // Check if the logged-in user's ID matches the postedBy field
    const postedByAds = await Ad.find({
      postedBy: userId,
      hired_user: { $exists: true, $ne: null },
    }).populate("hired_user", "-password");

    // Check if the logged-in user's ID matches the hired_user field
    const hiredUserAds = await Ad.find({ hired_user: userId }).populate(
      "postedBy",
      "name"
    );

    let ads;
    if (postedByAds.length > 0) {
      ads = postedByAds;
    } else if (hiredUserAds.length > 0) {
      ads = hiredUserAds;
    } else {
      return response.notFound(res, "No relevant ads found.");
    }

    return response.success(res, "Ads retrieved successfully.", { ads });
  } catch (error) {
    console.error(`Error getting hired user details: ${error}`);
    return response.serverError(res, "Error getting hired user details.");
  }
};

// write a function where the creator of the add can update the status of the add to completed
const updateAdStatus = async (req, res) => {
  try {
    const adId = req.query.adId;
    const responseId = req.query.responseId;
    if (!adId) {
      return response.badRequest(res, "Ad ID is required");
    }

    const ad = await Ad.findById(adId);

    if (!ad) {
      return response.notFound(res, "Ad not found");
    }

    if (ad.postedBy.toString() !== req.user.id) {
      console.log(req.user.id);

      return response.authError(
        res,
        "Only the creator of the ad can update the status"
      );
    }

    ad.isCompleted = true;
    await ad.save();

    const adResponse = await AdResponse.findById(responseId);
    let notiData = {};
    let notification = new Notification({
      title: `Ad status updated to completed`,
      content: `Ad status updated to completed`,
      icon: "check-box",
      data: JSON.stringify(notiData),
      user_id: ad.hired_user
    });
    await notification.save();
    let notiTokens = await FcmToken.find({ user_id: req.user.id });
    for (let i = 0; i < notiTokens.length; i++) {
      const token = notiTokens[0];

      await sendNotification(
        `You've received a new notification "${req.body.name}"`,
        notiData,
        token.token
      );
    }

    return response.success(res, "Ad status updated successfully", {
      ad,
      responseMessage: adResponse.name,
    });
  } catch (error) {
    console.error(`Error updating ad status: ${error}`);
    return response.serverError(res, "Error updating ad status");
  }
};

// function to create response
const createResponse = async (req, res) => {
  try {
    console.log(req.user);
    const { name } = req.body;
    const newResponse = new AdResponse({ name }); // Use a different name for the response object
    await newResponse.save();
    return response.success(res, "Response created successfully", {
      newResponse,
    });
  } catch (error) {
    return response.badRequest(
      res,
      "A response with that name already exists."
    );
  }
};

// get all responses
const getAllResponses = async (req, res) => {
  try {
    const responses = await AdResponse.find();
    return response.success(res, "All responses retrieved successfully", {
      responses,
    });
  } catch (error) {
    console.log(error);
    return response.serverError(res, "Failed to load responses");
  }
};

// const updateFeatureStatus = async (req, res) => {
//   try {
//     const { adId } = req.body;

//     const ad = await Ad.findById(adId);
//     if (!ad) {
//       return response.notFound(res, "Ad not found");
//     }

//     ad.featured = true;
//     await ad.save();

//     return response.success(res, "Feature status updated successfully", {
//       ad,
//     });
//   } catch (error) {
//     console.error(`Error updating feature status: ${error}`);
//     return response.serverError(res, "Error updating feature status");
//   }
// };

const updateFeatureStatus = async (req, res) => {
  try {
    const { adId } = req.query; // Extract adId from query parameters
    const { featured } = req.body; // Extract featured from request body

    const ad = await Ad.findById(adId);
    if (!ad) {
      return response.notFound(res, "Ad not found");
    }

    ad.featured = featured; // Update featured status
    await ad.save();

    return response.success(res, "Feature status updated successfully", {
      ad,
    });
  } catch (error) {
    console.error(`Error updating feature status: ${error}`);
    return response.serverError(res, "Error updating feature status");
  }
};



console.log();
module.exports = {
  postAd,
  getAllAds,
  GetAdddetails,
  acceptProposal,
  getHiredUser,
  getHiredUsersAndAds,
  updateAdStatus,
  updateFeatureStatus,
  createResponse,
  getAllResponses,
};
