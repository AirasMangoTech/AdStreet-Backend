const Ad = require("../models/ad");
const Blog = require("../models/blogs");
const Proposal = require("../models/proposals");
const FcmToken = require("../models/fcmTokens");
const User = require("../models/users");
const Admeet = require("../models/admeet");
const Interest = require("../models/interest");
const Adpro = require("../models/adpro");
const Notification = require("../models/notifications");
const sendNotification = require("../utils/sendNotifications");
const response = require("../utils/responseHelpers");
const { ROLE_IDS } = require("../utils/utility");
const mongoose = require("mongoose");
const moment = require("moment");
const RegistrationAdpro = require("../models/adpro");

// const getAllAds = async (req, res) => {
//   try {
//     if (req.user.role_id !== ROLE_IDS.ADMIN)
//       return response.forbidden(
//         res,
//         "You don't have permission to perform this action"
//       );
//     let query = {};
//     let userLookupPipeline = [];
//     if (req.query.user_id) {
//       query.postedBy = new mongoose.Types.ObjectId(req.query.user_id);
//     }
//     if (req.query.adId) {
//       query._id = new mongoose.Types.ObjectId(req.query.adId);
//     }
//     if (req.query.roles) {
//       const usersWithRoles = await User.find({ roles: req.query.roles }, "_id");
//       const userIds = usersWithRoles.map((user) => user._id);
//       query.roles = { $in: userIds };
//     }
//     if (req.query.roles) {
//       userLookupPipeline.unshift({
//         $match: {
//           roles: req.query.roles, // Assumes roles field exists and contains the role
//         },
//       });
//     }
//     if (req.query.category !== undefined) {
//       const categories = req.query.category.split(",");
//       const categoryObjectIDs = categories.map(
//         (category) => new mongoose.Types.ObjectId(category)
//       );
//       query.category = { $in: categoryObjectIDs };
//     }
//     if(req.query.featured){
//       query.featured = true;
//     }
//     const getStartOfDay = (date) => {
//       return moment(date).startOf("day").toDate();
//     };
//     const getEndOfDay = (date) => {
//       return moment(date).endOf("day").toDate();
//     };
//     if (req.query.valid_till_from && req.query.valid_till_to) {
//       query.valid_till = {
//         $gte: getStartOfDay(new Date(req.query.valid_till_from)),
//         $lte: getEndOfDay(new Date(req.query.valid_till_to)),
//       };
//     } else if (req.query.valid_till_from) {
//       query.valid_till = {
//         $gte: getStartOfDay(new Date(req.query.valid_till_from)),
//       };
//     } else if (req.query.valid_till_to) {
//       query.valid_till = {
//         $lte: getEndOfDay(new Date(req.query.valid_till_to)),
//       };
//     }
//     // Date range for createdAt
//     if (req.query.created_at_from && req.query.created_at_to) {
//       query.createdAt = {
//         $gte: getStartOfDay(new Date(req.query.created_at_from)),
//         $lte: getEndOfDay(new Date(req.query.created_at_to)),
//       };
//     } else if (req.query.created_at_from) {
//       query.created_at = {
//         $gte: getStartOfDay(new Date(req.query.created_at_from)),
//       };
//     } else if (req.query.created_at_to) {
//       query.created_at = {
//         $lte: getEndOfDay(new Date(req.query.created_at_to)),
//       };
//     }

//     let matchQuery = {};

//     const page = parseInt(req.query.page) || 1; // Default to page 1
//     const limit = parseInt(req.query.limit) || 10; // Default limit to 10 items
//     const skip = (page - 1) * limit;
//     userLookupPipeline.push(
//       {
//         $match: {
//           $expr: {
//             $eq: ["$_id", "$$postedBy"],
//           },
//         },
//       },
//       {
//         $project: {
//           password: 0, // Exclude the password field
//         },
//       }
//     );

//     const ads = await Ad.aggregate([
//       {
//         $match: query,
//       },
//       {
//         $lookup: {
//           from: "proposals",
//           localField: "_id",
//           foreignField: "adId",
//           as: "proposals",
//         },
//       },
//       {
//         $lookup: {
//           from: "users",
//           let: { postedBy: "$postedBy" },
//           pipeline: userLookupPipeline,
//           as: "postedBy",
//         },
//       },
//       {
//         $lookup: {
//           from: "categories", // Assuming the collection name is "categories" for categories data
//           localField: "category",
//           foreignField: "_id",
//           as: "category",
//         },
//       },
//       {
//         $project: {
//           _id: 1,
//           title: 1,
//           category: 1, // unwind category array if necessary
//           // images: 1,
//           description: 1,
//           budget: 1,
//           jobDuration: 1,
//           featured: 1,
//           postedBy: { $arrayElemAt: ["$postedBy", 0] }, // unwind postedBy array if necessary
//           createdAt: 1,
//           image: 1,
//           isApproved: 1,
//           isHired: 1,
//           isCompleted: 1,
//           valid_till: 1,
//           totalProposals: { $size: "$proposals" },
//         },
//       },
//       { $sort: { featured: -1, createdAt: -1 } },
//       { $skip: skip },
//       { $limit: limit },
//     ]);

//     const totalAds = await Ad.countDocuments(query);
//     const totalPages = Math.ceil(totalAds / limit);
//     console.log(query);
//     return response.success(res, "All ads retrieved successfully", {
//       ads,
//       totalAds,
//       totalPages,
//       currentPage: page,
//     });
//   } catch (error) {
//     console.error(`Error getting all ads: ${error}`);
//     return response.serverError(res, "Error getting all ads");
//   }
// };

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

    let notiTitle_user = "Job Approved";
    let notiDescription_user =
      "Thank you for posting the job. Your request has been approved by the admin.";

    if (!isApproved) {
      notiTitle_user = "Job Rejected";
      notiDescription_user =
        "Your request to post a job has been rejected by the admin.";
    }

    let notiData_user = {
      id: ad.id,
      pagename: "Contracts",
      title: notiTitle_user,
      body: notiDescription_user,
    };

    let notification_user = new Notification({
      title: notiTitle_user,
      content: notiDescription_user,
      icon: "check-box",
      data: JSON.stringify(notiData_user),
      user_id: ad.postedBy,
    });
    await notification_user.save();

    let notiTokens_user = await FcmToken.find({ user_id: ad.postedBy });

    if (notiTokens_user.length > 0) {
      const tokenList_user = notiTokens_user.map((tokenDoc) => tokenDoc.token);

      if (tokenList_user.length > 0) {
        tokenList_user.forEach((token) =>
          sendNotification(notiTitle_user, notiDescription_user, notiData_user, token)
        );
      }
    }

    return response.success(res, "Ad approval status updated", { ad });
  } catch (error) {
    console.error(`Error updating ad: ${error}`);
    return response.serverError(res, "Error updating ad");
  }
};

const getAllBlogs = async (req, res) => {
  try {
    let query = {};
    if (req.query.isApproved) {
      query.isApproved = req.query.isApproved;
    }

    if (req.query.id) {
      query._id = new mongoose.Types.ObjectId(req.query.id);
    }

    if (req.query.category !== undefined) {
      const categories = req.query.category.split(",");
      const categoryObjectIDs = categories.map(
        (category) => new mongoose.Types.ObjectId(category)
      );
      query.category = { $in: categoryObjectIDs };
    }
    if (req.query.title) {
      query.title = { $regex: new RegExp(req.query.title, "i") };
    }
    if (req.query.type) {
      query.type = { $regex: new RegExp(req.query.type, "i") };
    }

    if (req.query.event_type) {
      query.event_type = { $regex: new RegExp(req.query.event_type, "i") };
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
    console.error(`Error getting all blogs: ${error}`);
    return res.status(500).json({ error: error.message });
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

const blogCounts = async (req, res) => {
  try {
    const blogCountsByTypeAndMonth = await Blog.aggregate([
      {
        $group: {
          _id: {
            type: "$type",
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const totalBlogCountsByType = await Blog.aggregate([
      {
        $group: {
          _id: "$type",
          total: { $sum: 1 },
        },
      },
    ]);

    const countsByTypeAndMonth = {};
    const totalBlogCounts = {};

    blogCountsByTypeAndMonth.forEach((entry) => {
      if (entry._id.type) {
        // Add null check for _id.type
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
      if (entry._id) {
        // Add null check for _id
        const type = entry._id.toLowerCase().trim();
        totalBlogCounts[type] = entry.total;
      }
    });

    return response.success(res, "Blog counts by type and month", {
      countsByTypeAndMonth,
      totalBlogCounts,
    });
  } catch (err) {
    console.error("Failed to get blog counts", err);
    return response.serverError(res, "Failed to get blog counts");
  }
};

const approveBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return response.notFound(res, "Blog not found");
    }

    const { isApproved } = req.body;

    const userId = blog.user_id;
    blog.isApproved = isApproved;
    blog.status = isApproved;
    await blog.save();

    let notiTitle_user = "Blog Approved";
    let notiDescription_user =
      "Thank you for posting the blog. Your request has been approved by the admin.";

    if (!isApproved) {
      notiTitle_user = "Blog Rejected";
      notiDescription_user =
        "Your request to post a blog has been rejected by the admin.";
    }

    let notiData_user = {
      id: blog.id,
      pagename: "",
      title: notiTitle_user,
      body: notiDescription_user,
    };

    let notification_user = new Notification({
      title: notiTitle_user,
      content: notiDescription_user,
      icon: "check-box",
      data: JSON.stringify(notiData_user),
      user_id: userId,
    });
    await notification_user.save();

    let notiTokens_user = await FcmToken.find({ user_id: userId });

    if (notiTokens_user.length > 0) {
      const tokenList_user = notiTokens_user.map((tokenDoc) => tokenDoc.token);

      if (tokenList_user.length > 0) {
        tokenList_user.forEach((token) =>
          sendNotification(notiTitle_user, notiDescription_user, notiData_user, token)
        );
      }
    }

    return response.success(res, "Blog approved successfully", { blog });
  } catch (error) {
    console.error(`Error approving blog: ${error}`);
    return response.serverError(res, "Error approving blog");
  }
};

const getAllAds = async (req, res) => {
  try {
    if (req.user.role_id !== ROLE_IDS.ADMIN)
      return response.forbidden(
        res,
        "You don't have permission to perform this action"
      );

    let query = {};

    if (req.query.user_id) {
      query.postedBy = new mongoose.Types.ObjectId(req.query.user_id);
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

    if (req.query.featured) {
      query.featured = true;
    }

    if (req.query.isCompleted) {
      query.isCompleted = true;
    }

    if (req.query.isApproved) {
      query.isApproved = true;
    }

    if (req.query.isHired) {
      query.isHired = true;
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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const userLookupPipeline = [
      {
        $match: {
          $expr: {
            $eq: ["$_id", "$$postedBy"],
          },
        },
      },
      {
        $project: {
          password: 0,
        },
      },
    ];

    if (req.query.roles) {
      userLookupPipeline.unshift({
        $match: {
          roles: req.query.roles,
        },
      });
    }

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
          from: "categories",
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
          description: 1,
          budget: 1,
          jobDuration: 1,
          featured: 1,
          postedBy: { $arrayElemAt: ["$postedBy", 0] },
          createdAt: 1,
          image: 1,
          isApproved: 1,
          isHired: 1,
          isCompleted: 1,
          valid_till: 1,
          totalProposals: { $size: "$proposals" },
        },
      },
      { $sort: { featured: -1, createdAt: -1 } },
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

const updateAdPro = async (req, res) => {
  try {
    const adpro = await RegistrationAdpro.findById(req.params.id);
    if (!adpro) {
      return response.notFound(res, "AdPro not found");
    }

    const { isContacted } = req.body;

    adpro.isContacted = isContacted;
    await adpro.save();

    return response.success(res, "AdPro updated successfully", { adpro });
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
  approveBlog,
  updateAdPro,
};
