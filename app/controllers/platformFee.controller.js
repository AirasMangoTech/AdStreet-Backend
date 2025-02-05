const PlatformFee = require("../models/platformFee");
const response = require("../utils/responseHelpers");

exports.createFee = async (req, res) => {
  try {
    const fees = await PlatformFee.findOne();
    if (fees) {
      return response.badRequest(
        res,
        "Fees is already defined, try updating it."
      );
    }
    await PlatformFee.create(req.body);
    response.success(res, "Fee created successfuly.");
  } catch (err) {
    console.error("Error creating fees", err);
    response.serverError(res, "Server error");
  }
};

exports.updateFee = async (req, res) => {
  try {
    const fees = await PlatformFee.findOne();
    fees.fee = req.body.fee;
    await fees.save();

    response.success(res, `Fees updated to ${req.body.fee}`);
  } catch (err) {
    console.error("Error updating error", err);
    response.serverError(res, "Server error");
  }
};

exports.getFee = async (req, res) => {
  try {
    const fee = await PlatformFee.findOne();
    response.success(res, "Fee retrieved successfuly.", {
      fee,
    });
  } catch (err) {
    console.error("Error getting fees.", err);
    response.serverError(res, "Server error");
  }
};

exports.deleteFee = async (req, res) => {
  try {
    const fees = await PlatformFee.findOne();
    await PlatformFee.findByIdAndDelete(fees.id);

    response.success(
      res,
      "Fees deleted succesfulyy. User won't be charged platform fee."
    );
  } catch (err) {
    console.error("Error deleting fees.", err);
    response.serverError(res, "Server error");
  }
};
