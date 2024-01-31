const Ad = require("../models/ad");
const response = require("../utils/responseHelpers");
const {ROLE_IDS} = require('../utils/utility');

const approveAd = async (req, res) => {
  const { isApproved } = req.body;

  try {
   
    if (req.user.role_id !== ROLE_IDS.ADMIN)
      return response.forbidden( res,"You don't have permission to perform this action");

    const ad = await Ad.findById(req.params.id);
    if (!ad) {
      return response.notFound(res, "Ad not found");
    }

    ad.isApproved = isApproved;
    await ad.save();

    return response.success(res, "Ad approval status updated", {ad});
  } catch (error) {
    console.error(`Error updating ad: ${error}`);
    return response.serverError(res, "Error updating ad");
  }
};

module.exports = {approveAd}