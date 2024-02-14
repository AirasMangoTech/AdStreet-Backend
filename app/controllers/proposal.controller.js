const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const Proposal = require("../models/proposals");
const Notification = require("../models/notifications");
const sendNotification = require("../utils/sendNotification");
const FcmToken = require("../models/fcmTokens");
const Users = require("../models/users");
const Ad = require("../models/ad");
const response = require("../utils/responseHelpers");
const { ROLE_IDS } = require("../utils/utility");
const postProposal = async (req, res) => {
  try {

    const adId = req.body.adId;
    const ad = await Ad.findById(adId);
    
    if (req.user.id.toString() === ad.postedBy.toString()) {
      return response.badRequest(res,"You cannot post a proposal on your own ad", 400);
    }

    const user = await Users.findById(req.user.id);
    if (!user || (req.user.role_id !== ROLE_IDS.INDIVIDUAL || req.user.role_id !== ROLE_IDS.AGENCY)) {
      return response.forbidden(res, "Only users with the role of individual or agency can post proposals", 403);
    }

    if (!req.body.content || !req.body.budget || !req.body.jobDuration) {
      return response.badRequest(res, "Missing required fields", 400);
    }

    

    if (!ad) {
      return response.notFound(res, "Ad not found", 404);
    }
    

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
    return response.success(res, "Proposal submitted successfully", {
      proposal,
    });
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

// const getHiredUser = async (req, res) => {
//   try {
//     const { adId } = req.query;

//     // Query the database to find the proposal submitted by the current user for the specified ad
//     const proposal = await Proposal.findOne({ adId, submittedBy: req.user.id, status: 'true' });

//     if (!proposal) {
//       return response.notFound(res, 'You have not been hired for this ad.');
//     }

//     return response.success(res, 'You have been hired for this ad.', { hiredUser: proposal.submittedBy });
//   } catch (error) {
//     console.error(`Error getting hired user details: ${error}`);
//     return response.serverError(res, 'Error getting hired user details.');
//   }
// };

const getHiredUser = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log(userId);
    // Find all proposals where the user is hired
    const proposals = await Proposal.find({ submittedBy: userId, status: 'true' });

    if (!proposals || proposals.length === 0) {
      return response.notFound(res, 'You have not been hired for any ads.');
    }

    // Extract ad IDs from the proposals
    const adIds = proposals.map(proposal => proposal.adId);

    // Find all ads corresponding to the extracted ad IDs
    const ads = await Ad.find({ _id: { $in: adIds } })
      .populate('postedBy', 'name')
      .populate('category');

    return response.success(res, 'Ads retrieved successfully.', { ads });
  } catch (error) {
    console.error(`Error getting hired user details: ${error}`);
    return response.serverError(res, 'Error getting hired user details.');
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
  getHiredUser
};
