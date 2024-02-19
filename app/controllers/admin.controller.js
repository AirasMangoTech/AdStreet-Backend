const Ad = require("../models/ad");
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
                roles: 1, // Include the roles field
                name: 1, // Include the name field
              },
            },
          ],
          as: "postedBy",
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category_docs",
        },
      },
      {
        $unwind: "$category_docs", // Unwind the array of category documents
      },
      {
        $project: {
          _id: 1,
          title: 1,
          category: "$category_docs", // unwind category array if necessary
         // images: 1,
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
      {
        $group: {
          _id: "$_id",
          title: { $first: "$title" },
          category: { $push: "$category" }, // Group back into an array of categories
          images: { $first: "$images" },
          description: { $first: "$description" },
          budget: { $first: "$budget" },
          jobDuration: { $first: "$jobDuration" },
          postedBy: { $first: "$postedBy" },
          createdAt: { $first: "$createdAt" },
          image: { $first: "$image" },
          isApproved: { $first: "$isApproved" },
          valid_till: { $first: "$valid_till" },
          totalProposals: { $first: "$totalProposals" },
        },
      },
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

module.exports = {
  approveAd,
  getAllAds,
};
