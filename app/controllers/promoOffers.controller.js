const Promo = require('../models/promoOffers'); 
const response = require("../utils/responseHelpers");

exports.createPromo = async (req, res) => {
  try {
    const newPromo = await Promo.create(req.body);
    return response.success(res, "Promo created successfully", {newPromo});
  } catch (error) {
    return response.serverError(res, `Error creating promo: ${error}`);
  }
};

exports.getAllPromos = async (req, res) => {
  try {

    let query = {};

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const promos = await Promo.find(query)
    .skip(skip)
    .limit(limit);

    const totalPromos = await FreshLeaks.countDocuments(query);
    const totalPages = Math.ceil(totalPromos / limit);

    return response.success(res, "Promos retrieved successfully", {
      promos,
      totalPromos,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    return response.serverError(res, `Error retrieving promos: ${error}`);
  }
};

exports.updatePromo = async (req, res) => {
  try {
    const promo = await Promo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      
    });
    if (!promo) {
      return response.badRequest(res, "Promo not found", 404);
    }
    return response.success(res, "Promo updated successfully", {promo});
  } catch (error) {
    return response.serverError(res, `Error updating promo: ${error}`);
  }
};

exports.deletePromo = async (req, res) => {
  try {
    const promo = await Promo.findByIdAndDelete(req.params.id);
    if (!promo) {
      return response.badRequest(res, "Promo not found", 404);
    }
    return response.success(res, "Promo deleted successfully", {promo});
  } catch (error) {
    return response.serverError(res, `Error deleting promo: ${error}`);
  }
};
