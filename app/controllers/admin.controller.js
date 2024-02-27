const Ad = require("../models/ad");
const Blog = require("../models/blogs");
const Proposal = require("../models/proposals");
const User = require("../models/users");
const response = require("../utils/responseHelpers");
const { ROLE_IDS } = require("../utils/utility");
const mongoose = require("mongoose");
const moment = require("moment");

const getAllAds = async (req, res) => {
  try {
    console.log(req.user.role_id);
    if (req.user.role_id !== ROLE_IDS.ADMIN)
      return response.forbidden(
        res,
        "You don't have permission to perform this action"
      );

    const getStartOfDay = (date) => {
      return moment(date).startOf("day").toDate();
    };
    let query = {};
    if (req.query.user_id) {
      query.postedBy = new mongoose.Types.ObjectId(req.query.user_id);
    }
    if (req.query.adId) {
      query._id = new mongoose.Types.ObjectId(req.query.adId);
    }
    // Function to get the end of the day for a given date using Moment.js
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
      query.createdAt = {
        $gte: getStartOfDay(new Date(req.query.created_at_from)),
      };
    } else if (req.query.created_at_to) {
      query.createdAt = {
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
    const page = parseInt(req.query.page, 10) || 1; // Default to page 1
    const limit = parseInt(req.query.limit, 10) || 10; // Default limit to 10 items
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
          category: 1, // unwind category array if necessary
          // images: 1,
          description: 1,
          budget: 1,
          jobDuration: 1,
          postedBy: { $arrayElemAt: ["$postedBy", 0] }, // unwind postedBy array if necessary
          createdAt: 1,
          image: 1,
          isApproved: 1,
          isHired: 1,
          isCompleted: 1,
          valid_till: 1,
          totalProposals: { $size: "$proposals" },
        },
      },
      { $skip: skip },
      { $limit: limit },
      { $sort: { createdAt: -1 } },
    ]);

    const totalAds = await Ad.countDocuments(query);
    const totalPages = Math.ceil(totalAds / limit);
    console.log(ads);
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

const approveAd = async (req, res) => {
  const { isApproved } = req.body;

  try {
    if (req.user.role_id !== ROLE_IDS.ADMIN)
      return response.forbidden(
        res,
        "You don't have permission to perform this action"
      );

    const ad = await Ad.findById(req.params.id);
    if (!ad) {
      return response.notFound(res, "Ad not found");
    }

    ad.isApproved = isApproved;
    await ad.save();

    return response.success(res, "Ad approval status updated", { ad });
  } catch (error) {
    console.error(`Error updating ad: ${error}`);
    return response.serverError(res, "Error updating ad");
  }
};

const getAllBlogs = async (req, res) => {
  try {
    let query = {};
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skipIndex = (page - 1) * limit;

    const blogs = await Blog.find(query)
      .populate("category")
      .populate("blogCategory")
      .sort({ createdAt: -1 })
      .skip(skipIndex)
      .limit(limit);
    const totalBlogs = await Blog.countDocuments();
    const totalPages = Math.ceil(totalBlogs / limit);

    return response.success(res, "All blogs retrieved successfully", {
      blogs,
      pageInfo: {
        currentPage: page,
        totalPages,
        totalBlogs,
        limit,
      },
    });
  } catch (error) {
    return response.authError(res, "something bad happened");
  }
};

const getAdStreetStats = async (req, res) => {
  try {
    // Aggregation pipeline for Ads by Month
    const adsByMonth = await Ad.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          totalAds: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Aggregation pipeline for Proposals by Month
    const proposalsByMonth = await Proposal.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },
          adId: 1,
        },
      },
      {
        $group: {
          _id: { month: "$month", adId: "$adId" },
          totalProposals: { $sum: 1 },
        },
      },
      { $sort: { "_id.month": 1, "_id.adId": 1 } },
    ]);

    // Assuming ROLE_IDS constants are correctly set to match the database values
    const totalIndividuals = await User.countDocuments({ roles: "INDIVIDUAL" });
    const totalCompanies = await User.countDocuments({roles: "BRAND_COMPANY"});
    const totalAgencies = await User.countDocuments({ roles: "AGENCY" });

    // Total Users excluding admins
    // const adminRoleId = new mongoose.Types.ObjectId("yourAdminRoleId");
    const totalUsers = await User.countDocuments();

    // Total Proposals
    const totalProposals = await Proposal.countDocuments();

    // Total Ads
    const totalAds = await Ad.countDocuments();

    // Building response
    const responseData = {
      adsStatsByMonth: adsByMonth,
      proposalsStatsByMonth: proposalsByMonth,
      totalUsers,
      totalIndividuals,
      totalCompanies,
      totalAgencies,
      totalProposals,
      totalAds,
    };

    // Use the success method of your response utility
    response.success(
      res,
      "AdStreet statistics retrieved successfully",
      responseData
    );
  } catch (error) {
    console.error(`Error fetching AdStreet statistics: ${error}`);
    response.serverError(
      res,
      "Error fetching AdStreet statistics",
      error.message
    );
  }
};

module.exports = {
  approveAd,
  getAllAds,
  getAllBlogs,
  getAdStreetStats,
};
