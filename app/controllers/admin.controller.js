const Ad = require("../models/ad");
const Blog = require("../models/blogs");
const Proposal = require("../models/proposals");
const FcmToken = require("../models/fcmTokens");
const User = require("../models/users");
const Admeet = require("../models/admeet");
const Interest = require("../models/interest");
const Adpro = require("../models/adpro");
const Notification = require("../models/notifications");
const sendNotification = require('../utils/sendNotifications');
const response = require("../utils/responseHelpers");
const { ROLE_IDS } = require("../utils/utility");
const mongoose = require("mongoose");
const moment = require("moment");

const getAllAds = async (req, res) => {
  try {
    if (req.user.role_id !== ROLE_IDS.ADMIN)
      return response.forbidden(
        res,
        "You don't have permission to perform this action"
      );
    let query = {};
    let userLookupPipeline = [];
    if (req.query.user_id) {
      query.postedBy = new mongoose.Types.ObjectId(req.query.user_id);
    }
    if (req.query.adId) {
      query._id = new mongoose.Types.ObjectId(req.query.adId);
    }
    if (req.query.roles) {
      const usersWithRoles = await User.find({ roles: req.query.roles }, "_id");
      const userIds = usersWithRoles.map((user) => user._id);
      query.roles = { $in: userIds };
    }
    if (req.query.roles) {
      userLookupPipeline.unshift({
        $match: {
          roles: req.query.roles, // Assumes roles field exists and contains the role
        },
      });
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

    let matchQuery = {};

    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default limit to 10 items
    const skip = (page - 1) * limit;
    userLookupPipeline.push(
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
      }
    );

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
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    const totalAds = await Ad.countDocuments(query);
    const totalPages = Math.ceil(totalAds / limit);
    console.log(query);
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

    let notiData = {};
    let notification = new Notification({
      title: `Thank you for posting for Ad`,
      content: `Thank you for posting for Ad, Your request is approved by the Admin`,
      icon: "check-box",
      data: JSON.stringify(notiData),
      user_id: ad.user_id,
    });
    await notification.save();
    let notiTokens = await FcmToken.find({ user_id: req.user.id });
    for (let i = 0; i < notiTokens.length; i++) {
      const token = notiTokens[0];

      await sendNotification(
        `You've received a new notification "${req.body.name}"`,
        notiData,
        token.token
      );}

    return response.success(res, "Ad approval status updated", { ad });
  } catch (error) {
    console.error(`Error updating ad: ${error}`);
    return response.serverError(res, "Error updating ad");
  }
};

const getAllBlogs = async (req, res) => {
  try {
    let query = {};
    if(req.query.isApproved){
      query.isApproved = req.query.isApproved;
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skipIndex = (page - 1) * limit;

    const blogs = await Blog.find(query)
      .populate("category")
      .populate("blogCategory")
      .sort({ createdAt: -1 })
      .skip(skipIndex)
      .limit(limit);
    const totalBlogs = await Blog.countDocuments(query);
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
        },
      },
      {
        $group: {
          _id: "$month",
          totalProposals: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Aggregation for Admeets where interest is true
    const interestedAdmeetsByMonth = await Interest.aggregate([
      {
        $match: { interest: true },
      },
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          totalInterested: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Total counts for other entities
    const totalIndividuals = await User.countDocuments({ roles: "Individual" });
    const totalCompanies = await User.countDocuments({
      roles: "Service Provider",
    });
    const totalAgencies = await User.countDocuments({
      roles: "Service Seeker",
    });
    const totalUsers = await User.countDocuments();
    const totalProposals = await Proposal.countDocuments();
    const totalAds = await Ad.countDocuments();
    const totalAdmeets = await Admeet.countDocuments();
    const totalAdPros = await Adpro.countDocuments();

    // Building response data
    const responseData = {
      adsStatsByMonth: adsByMonth,
      proposalsStatsByMonth: proposalsByMonth,
      interestedAdmeetsByMonth: interestedAdmeetsByMonth,
      totalUsers,
      totalIndividuals,
      totalCompanies,
      totalAgencies,
      totalProposals,
      totalAds,
      totalAdmeets,
      totalAdPros,
    };

    // Use the success method of your response utility, if available
    response.success(
      res,
      "AdStreet statistics retrieved successfully",
      responseData
    );
  } catch (error) {
    console.error(`Error fetching AdStreet statistics: ${error}`);
    // Use the serverError method of your response utility, if available
    response.serverError(
      res,
      "Error fetching AdStreet statistics",
      error.message
    );
  }
};

// const blogCounts = async (req, res) => {
//   try {
//     const blogCounts = await Blog.aggregate([
//       {
//         $group: {
//           _id: "$type",
//           count: { $sum: 1 },
//         },
//       },
//     ]);

//     const countsByType = {};

//     blogCounts.forEach((entry) => {
//       if (entry._id) {
//         const type = entry._id.toLowerCase().trim();
//         const key = "total" + type;
//         countsByType[key] = entry.count;
//       }
//     });
//     return response.success(res, "Blog by type count", countsByType);
//   } catch (err) {
//     console.error("Failed to get blog counts", err);
//     return response.serverError(res, "Failed to get blog counts");
//   }
// };


const blogCounts = async (req, res) => {
  try {
    // Get blog counts by type and month
    const blogCountsByTypeAndMonth = await Blog.aggregate([
      {
        $group: {
          _id: {
            type: "$type",
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get total count of each type of blog
    const totalBlogCountsByType = await Blog.aggregate([
      {
        $group: {
          _id: "$type",
          total: { $sum: 1 }
        }
      }
    ]);

    // Prepare the response object
    const countsByTypeAndMonth = {};
    const totalBlogCounts = {};

    // Process blog counts by type and month
    blogCountsByTypeAndMonth.forEach((entry) => {
      if (entry._id.type) { // Add null check for _id.type
        const type = entry._id.type.toLowerCase().trim();
        const monthYear = `${entry._id.year}-${entry._id.month}`;
        if (!countsByTypeAndMonth[type]) {
          countsByTypeAndMonth[type] = {};
        }
        countsByTypeAndMonth[type][monthYear] = entry.count;
      }
    });

    // Process total count of each type of blog
    totalBlogCountsByType.forEach((entry) => {
      if (entry._id) { // Add null check for _id
        const type = entry._id.toLowerCase().trim();
        totalBlogCounts[type] = entry.total;
      }
    });

    return response.success(res, "Blog counts by type and month", {
      countsByTypeAndMonth,
      totalBlogCounts
    });
  } catch (err) {
    console.error("Failed to get blog counts", err);
    return response.serverError(res, "Failed to get blog counts");
  }
};


// approve blog function


const approveBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return response.notFound(res, "Blog not found");
    }
    const userId = blog.user_id;
    blog.isApproved = true;
    await blog.save();
    
    let notiData = {};
    let notification = new Notification({
      title: `Thank you for posting for Blog`,
      content: `Thank you for posting for Blog, Your request is approved by the Admin`,
      icon: "check-box",
      data: JSON.stringify(notiData),
      user_id: userId,
    });
    await notification.save();
    let notiTokens = await FcmToken.find({ user_id: userId });
    for (let i = 0; i < notiTokens.length; i++) {
      const token = notiTokens[0];

      await sendNotification(
        `You've received a new notification "${req.body.name}"`,
        notiData,
        token.token
      );}
    return response.success(res, "Blog approved successfully", { blog });
  } catch (error) {
    console.error(`Error approving blog: ${error}`);
    return response.serverError(res, "Error approving blog");
  }
};

module.exports = {
  approveAd,
  getAllAds,
  getAllBlogs,
  getAdStreetStats,
  blogCounts,
  approveBlog
};
