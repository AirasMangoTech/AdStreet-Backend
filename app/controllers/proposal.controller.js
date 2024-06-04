const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const Proposal = require("../models/proposals");
const Notification = require("../models/notifications");
const sendNotification = require("../utils/sendNotifications");
const FcmToken = require("../models/fcmTokens");
const Users = require("../models/users");
const Ad = require("../models/ad");
const response = require("../utils/responseHelpers");
const { ROLE_IDS } = require("../utils/utility");
const moment = require("moment");

const postProposal = async (req, res) => {
  try {
    const adId = req.body.adId;
    const ad = await Ad.findById(adId);

    if (req.user.id.toString() === ad.postedBy.toString()) {
      return response.badRequest(
        res,
        "You cannot post a proposal on your own ad",
        400
      );
    }

    // const user = await Users.findById(req.user.id);
    // //console.log(req.user.role_id !== ROLE_IDS.INDIVIDUAL);
    // console.log(user.roles);
    // if (
    //   !user ||
    //   (user.roles !== ROLE_IDS.INDIVIDUAL && user.roles !== ROLE_IDS.AGENCY)
    // ) {
    //   return response.forbidden(
    //     res,
    //     "Only users with the role of individual or agency can post proposals",
    //     403
    //   );
    // }

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

    let notiTitle = `New Proposal`;
    let notiDescription = `${req.user.name} sent you a proposal on your job post`;
 
    let notiData = {
      id: proposal.id,
      pagename: 'proposal',
      title: notiTitle,
      body: notiDescription
    };

    let notification = new Notification({
      title: notiTitle,
      content: notiDescription,
      icon: "note-pad",
      data: JSON.stringify(notiData),
      user_id: Ad.postedBy.id,
    });

    await notification.save();
    let notiToken = await FcmToken.find({ user_id: Ad.postedBy.id });
    if (notiToken.length > 0) {
      const tokenList = notiToken.map(tokenDoc => tokenDoc.token);
      await sendNotification(notiTitle, notiDescription, notiData, tokenList);
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
    let where = {};
    if (req.query.ad_id) {
      where.adId = req.query.ad_id;
    }
    // all proposals of the logged-in users
    if (req.query.user_id) {
      where.submittedBy = new mongoose.Types.ObjectId(req.query.user_id);
    }
    if (req.query.status) {
      where.status = req.query.status;
    }
    if (req.query.roles) {
      const usersWithRoles = await Users.find(
        { roles: req.query.roles },
        "_id"
      );
      const userIds = usersWithRoles.map((user) => user._id);
      where.submittedBy = { $in: userIds };
    }
    const getStartOfDay = (date) => {
      return moment(date).startOf("day").toDate();
    };
    const getEndOfDay = (date) => {
      return moment(date).endOf("day").toDate();
    };
    if (req.query.created_at_from && req.query.created_at_to) {
      where.createdAt = {
        $gte: getStartOfDay(new Date(req.query.created_at_from)),
        $lte: getEndOfDay(new Date(req.query.created_at_to)),
      };
    } else if (req.query.created_at_from) {
      where.created_at = {
        $gte: getStartOfDay(new Date(req.query.created_at_from)),
      };
    } else if (req.query.created_at_to) {
      query.created_at = {
        $lte: getEndOfDay(new Date(req.query.created_at_to)),
      };
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const proposals = await Proposal.find(where)
      .populate("submittedBy", "-password")
      .populate({
        path: "submittedBy",
        select: "-password",
        populate: [
          {
            path: "additional.services",
            model: "Service",
            select: "name",
          },
          {
            path: "additional.industry",
            model: "Industry",
            select: "name",
          },
        ],
      })
      .populate({
        path: "adId",
        populate: [
          {
            path: "category",
            model: "Category",
            select: "_id name",
          },
          {
            path: "postedBy",
            select: "-password",
          },
        ],
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalProposals = await Proposal.countDocuments(where);

    return response.success(res, "All proposals retrieved successfully", {
      proposals,
      total: totalProposals,
      page,
      pages: Math.ceil(totalProposals / limit),
    });
  } catch (error) {
    console.error(`Error getting all proposals: ${error}`);
    return response.serverError(res, "Error getting all proposals");
  }
};

const getHiredUser = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log(userId);
    // Find all proposals where the user is hired
    const proposals = await Proposal.find({
      submittedBy: userId,
      status: "true",
    });

    if (!proposals || proposals.length === 0) {
      return response.notFound(res, "You have not been hired for any ads.");
    }

    // Extract ad IDs from the proposals
    const adIds = proposals.map((proposal) => proposal.adId);

    // Find all ads corresponding to the extracted ad IDs
    const ads = await Ad.find({ _id: { $in: adIds } })
      .populate("postedBy", "name")
      .populate("category");

    return response.success(res, "Ads retrieved successfully.", { ads });
  } catch (error) {
    console.error(`Error getting hired user details: ${error}`);
    return response.serverError(res, "Error getting hired user details.");
  }
};

const getProposalsByAdId = async (req, res) => {
  try {
    let where = {};
    if (req.query.ad_id) {
      where.adId = req.query.ad_id;
    }

    const count = await Proposal.countDocuments(where);
    const proposals = await Proposal.find(where)
      .populate("submittedBy", "-password")
      .populate("adId", "isHired");

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
  getHiredUser,
};
