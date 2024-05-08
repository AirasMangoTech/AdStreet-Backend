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
    const freshLeaks = await FreshLeaks.find();
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
    if (!promo) {
      return response.badRequest(res, "freshLeaks not found", 404);
    }
    return response.success(res, "freshLeaks updated successfully", {freshLeaks});
  } catch (error) {
    return response.serverError(res, `Error updating promo: ${error}`);
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
