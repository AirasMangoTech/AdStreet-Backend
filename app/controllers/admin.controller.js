const Ad = require("../models/ad");
const response = require("../utils/responseHelpers");

exports.approveAd = async (req, res) => {
  const { adId } = req.params;
  const { isApproved } = req.body;

  try {
   
    if (req.user.role_id !== ROLE_IDS.ADMIN)
      return response.forbidden( res,"You don't have permission to perform this action");

    const ad = await Ad.findById(adId);
    if (!ad) {
      return response.notFound(res, "Ad not found");
    }

    ad.isApproved = isApproved;
    await ad.save();

    return response.success(res, "Ad approval status updated", ad);
  } catch (error) {
    console.error(`Error updating ad: ${error}`);
    return response.serverError(res, "Error updating ad");
  }
};
