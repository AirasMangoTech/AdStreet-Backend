const Proposal = require("../models/proposals");
const Notification = require('../models/notifications');
const FcmToken = require('../models/fcmTokens');
const Users = require('../models/users');
const response = require("../utils/responseHelpers");

const postProposal = async (req, res) => {
  try {
    if (!req.body.content || !req.body.budget || !req.body.jobDuration) {
      return response.error(res, "Missing required fields", 400);
    }
    console.log(req.user);
    const proposal = new Proposal({
      content: req.body.content,
      budget: req.body.budget,
      jobDuration: req.body.jobDuration,
      submittedBy: req.user.id,
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
        `${req.user.name} sent a NDA for you`,
        `You've received a new NDA "${req.body.name}" from ${req.user.name}`,
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
const getAllProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find().populate('submittedBy'); 

    return response.success(res, "All proposals retrieved successfully", { proposals });
  } catch (error) {
    console.error(`Error getting all proposals: ${error}`);
    return response.serverError(res, "Error getting all proposals");
  }
};

module.exports = {
  postProposal,
  getAllProposals
};
