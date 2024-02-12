const Proposal = require("../models/proposals");
const Notification = require("../models/notifications");
const sendNotification = require("../utils/sendNotification");
const FcmToken = require("../models/fcmTokens");
const Users = require("../models/users");
const Ad = require("../models/ad");
const response = require("../utils/responseHelpers");
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const postProposal = async (req, res) => {
  try {
    if (!req.body.content || !req.body.budget || !req.body.jobDuration) {
      return response.error(res, "Missing required fields", 400);
    }
    console.log(req.user);
    const adId = req.body.adId;
    const postedBy = Ad.postedBy;
    const proposal = new Proposal({
      content: req.body.content,
      budget: req.body.budget,
      jobDuration: req.body.jobDuration,
      submittedBy: req.user.id,
      postedBy: postedBy,
      adId: adId,
      image: req.body.imageUrl,
    });
    await proposal.save();

    let notiData = {};
    let notification = new Notification({
      title: `${req.user.name} sent you a proposal`,
      content: `${req.user.name} sent you a proposal on your job post`,
      icon: "note-pad",
      data: JSON.stringify(notiData),
      user_id: req.user.id,
    });
    await notification.save();

    let party2Tokens = await FcmToken.find({ user_id: req.user.id });
    for (let i = 0; i < party2Tokens.length; i++) {
      const token = party2Tokens[i];

      await sendNotification(
        `${req.user.name} sent a proposal`,
        notiData,
        token.token
      );
    }
    // Send a success response
    return response.success(res, "Proposal submitted successfully", {proposal});
  } catch (error) {
    console.log(error.message);
    return response.serverError(res, "An error has been occurred");
  }
};
// Get all proposals of an ad
const getAllProposals = async (req, res) => {
  try {
    let where = {};
    if (req.query.ad_id) {
      where.adId = req.query.ad_id;
    }
    // all proposals of the logged in users
    if (req.query.user_id) {
      where.submittedBy = new mongoose.Types.ObjectId(req.query.user_id);
    }
    const proposals = await Proposal.find(where).populate(
      "submittedBy",
      "-password"
    ); 
    return response.success(res, "All proposals retrieved successfully", {
      proposals,
    });
  } catch (error) {
    console.error(`Error getting all proposals: ${error}`);
    return response.serverError(res, "Error getting all proposals");
  }
};

const getProposalsByAdId = async (req, res) => {
  try {
   
   let where = {};
    if (req.query.ad_id) {
      where.adId = req.query.ad_id;
    }
    
    const count = await Proposal.countDocuments(where);
    const proposals = await Proposal.find(where).populate(
      "submittedBy",
      "-password"
    ); 

    return response.success(
      res,
      "Proposals for this ad ID retrieved successfully",
      {
        proposals: proposals,
        count: count,
      }
    );
  } catch (error) {
    console.error(`Error getting proposals for ad ID ${adId}: ${error}`);
    return response.serverError(res, "Error getting proposals for this ad ID");
  }
};

module.exports = {
  postProposal,
  getAllProposals,
  getProposalsByAdId,
};
