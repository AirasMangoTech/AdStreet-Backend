const Industry = require("../models/industry");
const User = require("../models/users");
const response = require("../utils/responseHelpers");
const { ROLE_IDS } = require("../utils/utility");

const createIndustry = async (req, res) => {
  try {
    if (req.user.role_id !== ROLE_IDS.ADMIN)
      return response.forbidden(
        res,
        "You don't have permission to perform this action"
      );
    const { name } = req.body;
    const industry = new Industry({ name });
    await industry.save();
    return response.success(res, "industry created successfully", { industry });
  } catch (error) {
    console.error(error);
    return response.serverError(
      res,
      "An error occurred while creating the industry."
    );
  }
};
// Implement similar controllers for updating, getting all, and deleting service types.

const updateIndustry = async (req, res) => {
  try {
    if (req.user.role_id !== ROLE_IDS.ADMIN) {
      return response.forbidden(
        res,
        "You don't have permission to perform this action"
      );
    }
    
    const industry = await Industry.findByIdAndUpdate(req.params.id, req.body, {new: true});
    if (!industry) {
      return response.notFound(
        res,
        `The industry with id ${req.params.id} was not found.`
      );
    }
    //console.log(err);
    return response.success(res, "industry updated successfully.", { industry });
  } catch (err){
    
    return response.serverError(
      res,
      "An error occurred while updating the industry."
    );
    
  }
};
//console.log(error);
const getAllIndustry = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not specified
    const limit = parseInt(req.query.limit) || 10; // Default limit to 10 items per page
    const skipIndex = (page - 1) * limit;
    const industry = await Industry.find()
      .sort({ createdAt: -1 })
      .skip(skipIndex)
      .limit(limit);
    const totalIndustry = await Industry.countDocuments();
    const totalPages = Math.ceil(totalIndustry / limit);
    
    const message = industry.length === 0 ? "No industry found" : "industry loaded successfully";
    return response.success(res, message, { industry, totalPages, totalIndustry, currentPage: page});
    
  } catch (error) {
    console.log(error);
    return response.serverError(res, error.message, "Failed to load industry");
  }
};

const deleteIndustry = async (req, res) => {
  try {
    if (req.user.role_id !== ROLE_IDS.ADMIN)
      return response.forbidden(
        res,
        "You don't have permission to perform this action"
      );
    const { id } = req.params;

    const isIndustryConnected = await User.findOne({ "additional.industry": id });

    if (isIndustryConnected) {
      return res.status(400).json({ error: "Cannot delete industry. It is connected to one or more users." });
    }

    await Industry.findByIdAndDelete(id);
    res.json({ message: "industry type deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createIndustry,
  updateIndustry,
  getAllIndustry,
  deleteIndustry,
};
// Implement similar controllers for updating, getting all, and deleting service types.
