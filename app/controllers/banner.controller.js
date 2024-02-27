const Banner = require("../models/banner");
const response = require("../utils/responseHelpers");

// Create and Save a new Banner
const createBanner = async (req, res) => {
  try {
    if (!req.body.imageUrl) {
      return response.badRequest(res, "Banner content can not be empty");
    }

    // Create a Banner
    const banner = new Banner({
      imageUrl: req.body.imageUrl,
    });
    await banner.save();
    return response.success(res, "Banner created successfully", { banner });
  } catch (err) {
    console.log(err);
    return response.serverError(res, `Error creating banner: ${err}`);
  }
};
// Retrieve all Banners from the database.
const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find();
    return response.success(res, "Banners retrieved successfully", { banners });
  } catch (err) {
    console.log(err);
    return response.serverError(res, `Error retrieving banners: ${err}`);
  }
};

module.exports = {
  createBanner,
  getAllBanners,
};
