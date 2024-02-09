const Ad = require("../models/ad");
const Proposal = require("../models/proposals");
const Notification = require("../models/notifications");
const sendNotification = require("../utils/sendNotification");
const FcmToken = require("../models/fcmTokens");
const response = require("../utils/responseHelpers");
const mongoose = require("mongoose");

const postAd = async (req, res) => {
  if (!req.user) {
    return response.forbidden(res, "User not authenticated", user);
  }
  try {
    const {
      title,
      category,
      description,
      budget,
      jobDuration,
      imageUrl,
      valid_till,
    } = req.body;
    //const image = req.file.path; // Assuming file paths are sent from the frontend and you're using a middleware like multer for file handling

    const newAd = new Ad({
      title,
      category,
      image: req.body.imageUrl,
      description,
      budget,
      jobDuration,
      postedBy: req.user.id,
      valid_till,
    });

    await newAd.save();
    let notiData = {};
    let notification = new Notification({
      title: `Thank you for listing`,
      content: `Thank you for listing your servive, Thank you your listing has been approved`,
      icon: "check-box",
      data: JSON.stringify(notiData),
      user_id: req.user.id,
    });
    await notification.save();
    let party2Tokens = await FcmToken.find({ user_id: req.user.id });
    for (let i = 0; i < party2Tokens.length; i++) {
      const token = party2Tokens[i];

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
    let query = { isApproved: true };
    if (req.query.title) {
      query.title = { $regex: new RegExp(req.query.title, "i") };
    }
    if (req.query.user_id) {
      query.postedBy = new mongoose.Types.ObjectId(req.query.user_id);
    }
    if (req.query.adId) {
      query._id = new mongoose.Types.ObjectId(req.query.adId);
    }
    if (req.query.category) {
      query.category = new mongoose.Types.ObjectId(req.query.category);
    }
    console.log(query.postedBy);
    //console.log(req.query.adId);
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
          from: "users", // Assuming the collection name is "users" for users data
          let: { postedBy: "$postedBy" },
          pipeline: [
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
          ],
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
          category: { $arrayElemAt: ["$category", 0] }, // unwind category array if necessary
          images: 1,
          description: 1,
          budget: 1,
          jobDuration: 1,
          postedBy: { $arrayElemAt: ["$postedBy", 0] }, // unwind postedBy array if necessary
          createdAt: 1,
          image: 1,
          isApproved: 1,
          valid_till: 1,
          totalProposals: { $size: "$proposals" },
        },
      },
    ]);

    return response.success(res, "All ads retrieved successfully", { ads });
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

    console.log("Ad details:", adDetails);

    if (!adDetails) {
      return response.notFound(res, "Ad not found");
    }
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
    const { adId, proposalId } = req.body;

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
    const proposalToAccept = await Proposal.findByIdAndUpdate(
      proposalId,
      { status: "true" },
      { new: true }
    ).populate("submittedBy", "_id");

    if (!proposalToAccept) {
      return response.notFound(res, "Proposal not found");
    }
    ad.hired_user = proposalToAccept.submittedBy;
    await ad.save();
    return response.success(res, "Proposal accepted successfully", {
      proposalToAccept,
      hired_user: ad.hired_user,
    });
  } catch (error) {
    console.error(`Error accepting proposal: ${error}`);
    return response.serverError(res, "Error accepting proposal");
  }
};
//function to get hired users for a specific ad
const getHiredUser = async (req, res) => {
  try {
    const { adId } = req.params;
    const ad = await Ad.findById(adId).populate("hired_user", "_id name email");
    if (!ad) {
      return response.notFound(res, "Ad not found");
    }
    return response.success(res, "Hired user retrieved successfully", {
      hired_user: ad.hired_user,
    });
  } catch (error) {
    console.error(`Error getting hired user: ${error}`);
    return response.serverError(res, "Error getting hired user");
  }
};

//function to get hired users for all the ads that are posted by the user
const getHiredUsersAndAds = async (req, res) => {
  try {
    // Assuming req.user.id contains the ID of the current user
    const userId = req.user.id;

    // Find ads posted by the current user with hired users
    const ads = await Ad.find({ postedBy: userId, hired_user: { $exists: true, $ne: null } }).populate("hired_user", "-password");

    // Check if any ads are found
    if (!ads || ads.length === 0) {
      return response.notFound(res, "No ads found for the user with hired users");
    }

    // Extract hired users from all ads
    const hiredUsers = ads.reduce((users, ad) => {
      if (ad.hired_user) {
        users.push(ad.hired_user);
      }
      return users;
    }, []);

    return response.success(res, "Hired users and ads retrieved successfully", { ads, hiredUsers });
  } catch (error) {
    console.error(`Error getting hired users and ads: ${error}`);
    return response.serverError(res, "Error getting hired users and ads");
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
};
