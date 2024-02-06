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
  // try {
  // const ads = await Ad.find({isApproved:true}).populate('Proposal');
  try {
    let query = { isApproved: true };
    // add search filter for ads by name
    if (req.query.title) {
      query.title = { $regex: new RegExp(req.query.title, "i") };
    }
    // Check for user_id 0in query parameters and add to the query if present
    if (req.query.user_id) {
      query.postedBy = req.query.user_id;
    }
    

    const ads = await Ad.find(query)
      .populate("category")
      .populate("postedBy", "-password");
      // const idArray = [];
      // ads.forEach(ad => {
      //   // Iterate over each document in the ad's documents array
      //   ad.documents.forEach(document => {
      //     // Push the _id of the current document to the idArray
      //     idArray.push(document._id);
      //   });
      // });
   // const count = await Proposal.countDocuments({ adId: { $in: {adIds : idArray}} });
    //ask about populate
    return response.success(res, "All ads retrieved successfully", { ads});
  } catch (error) {
    console.error(`Error getting all ads: ${error}`);
    return response.serverError(res, "Error getting all ads");
  }
};

const GetAdddetails = async (req, res) => {
  try {
    let where = {};
    if (req.query.adId) {
      where._id = req.query.adId;
    }
    const adDetails = await Ad.findOne(where)
      .populate("category")
      .populate("postedBy", "name email");

    console.log("Ad details:", adDetails);

    if (!adDetails) {
      return response.notFound(res, "Ad not found");
    }
    const userId = req.user.id;
    const proposal = await Proposal.findOne({
      submittedBy: userId,
      adId: adDetails._id,
    });
    // Check if the user has already applied for this proposal
    let userApplied = false;
    if (proposal) {
      userApplied = true;
    }
    // Update ad details to include the 'applied' flag
    const adDetailsWithAppliedFlag = {
      ...{adDetails}, // Convert to plain JavaScript object
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

console.log();
module.exports = {
  postAd,
  getAllAds,
  GetAdddetails,
};
