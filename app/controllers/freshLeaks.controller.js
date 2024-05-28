const FreshLeaks = require('../models/freshLeaks'); 
const response = require("../utils/responseHelpers");

exports.createFreshLeaks = async (req, res) => {
  try {
    const newFreshLeaks = await FreshLeaks.create(req.body);
    return response.success(res, "newFreshLeaks created successfully", {newFreshLeaks});
  } catch (error) {
    return response.serverError(res, `Error creating promo: ${error}`);
  }
};

exports.getAllFreshLeaks = async (req, res) => {
  try {
    let query = {};
    if (req.query.blogId) {
      query.blogId = req.query.blogId;
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const freshLeaks = await FreshLeaks.find(query) 
    .skip(skip)
    .limit(limit);

    const totalLeaks = await FreshLeaks.countDocuments(query);
    const totalPages = Math.ceil(totalLeaks / limit);

    return response.success(res, "freshLeaks retrieved successfully", {
      freshLeaks,
      totalLeaks,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    return response.serverError(res, `Error retrieving promos: ${error}`);
  }
};

exports.getLeak = async (req, res) => {
  try {
    
    const freshLeaks = await FreshLeaks.find().populate('blogId');
    return response.success(res, "freshLeaks retrieved successfully", {freshLeaks});
  } catch (error) {
    return response.serverError(res, `Error retrieving promos: ${error}`);
  }
};

exports.updateFreshLeaks = async (req, res) => {
  try {
    const freshLeaks = await FreshLeaks.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      
    });
    if (!freshLeaks) {
      return response.badRequest(res, "freshLeaks not found", 404);
    }
    return response.success(res, "freshLeaks updated successfully", {freshLeaks});
  } catch (error) {
    return response.serverError(res, `Error updating freshLeaks: ${error}`);
  }
};

exports.deleteFreshLeaks = async (req, res) => {
  try {
    const freshLeaks = await FreshLeaks.findByIdAndDelete(req.params.id);
    if (!freshLeaks) {
      return response.badRequest(res, "freshLeaks not found", 404);
    }
    return response.success(res, "Promo deleted successfully", {freshLeaks});
  } catch (error) {
    return response.serverError(res, `Error deleting promo: ${error}`);
  }
};
