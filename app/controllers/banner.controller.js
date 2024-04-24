const Banner = require("../models/banner");
const response = require("../utils/responseHelpers");

// Create and Save a new Banner
const createBanner = async (req, res) => {
  try {
    if (!req.body.imageUrl) {
      return response.badRequest(res, "Banner content can not be empty");
    }
    const banner = new Banner({
      imageUrl: req.body.imageUrl,
      type: req.body.type,
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
    let query = {};
    if (req.query.type) {
      query.type = req.query.type;
    }
    const banners = await Banner.find(query);
    return response.success(res, "Banners retrieved successfully", { banners });
  } catch (err) {
    console.log(err);
    return response.serverError(res, `Error retrieving banners: ${err}`);
  }
};
//update banner
const updateBanner = async (req, res) => {
  try {
    const bannerId = req.params.id;
    const banner = await Banner.findByIdAndUpdate(bannerId, req.body, {
      new: true, //return updated user document
    });
    if (!banner) {
      return response.notFound(res, "Banner not found");
    }
    return response.success(res, "Banner updated successfully", { banner });
  } catch (err) {
    console.log(err);
    return response.serverError(res, `Error updating banner: ${err}`);
  }
};

// delete banner
const deleteBanner = async (req, res) => {
  try {
    const bannerId = req.params.id;
    const banner = await Banner.findByIdAndDelete(bannerId);
    if (!banner) {
      return response.notFound(res, "Banner not found");
    }
    return response.success(res, "Banner deleted successfully");
  } catch (err) {
    console.log(err);
    return response.serverError(res, `Error deleting banner: ${err}`);
  }
};

module.exports = {
  createBanner,
  getAllBanners,
  updateBanner,
  deleteBanner,
};
