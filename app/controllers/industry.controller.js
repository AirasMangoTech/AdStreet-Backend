const Industry = require("../models/industry");
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
    let query = {};
        if (req.body.name) {
            query["name"] = req.body.name;
        } else {
            return response.badRequest(res, "Invalid data provided.");
        }
    const industry = await Industry.findByIdAndUpdate(req.params.id, query, {new: true});
    if (!industry) {
      return response.notFound(
        res,
        `The industry with id ${req.params.id} was not found.`
      );
    }
    return response.success(res, "industry updated successfully.", { industry });
  } catch (err){
    return response.serverError(
      res,
      "An error occurred while updating the industry."
    );
  }
};

const getAllIndustry = async (req, res) => {
  try {
    const industry = await Industry.find();
        if (industry.length === 0) {
          return response.notFound(
                res,
                "No industry found based on the search criteria"
          );
        }
    return response.success(res, "Successfully retrieved all industries", { industry}
    )
  } catch (error) {
        return response.serverError(
          res,
          "An error occurred while retrieving the industries."
        );
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
    console.log(id);
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
