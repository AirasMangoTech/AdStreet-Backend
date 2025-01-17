const Service = require("../models/services");
const User = require("../models/users");
const response = require("../utils/responseHelpers");
const { ROLE_IDS } = require("../utils/utility");

const createServiceType = async (req, res) => {
  try {
    if (req.user.role_id !== ROLE_IDS.ADMIN)
      return response.forbidden(
        res,
        "You don't have permission to perform this action"
      );
    const { name } = req.body;
    const service = new Service({ name });
    await service.save();
    return response.success(res, "Service created successfully", { service });
  } catch (error) {
    console.error(error);
    return response.serverError(
      res,
      "An error occurred while creating the service type."
    );
  }
};
// Implement similar controllers for updating, getting all, and deleting service types.

const updateServiceType = async (req, res) => {
  try {
    if (req.user.role_id !== ROLE_IDS.ADMIN) {
      return response.forbidden(
        res,
        "You don't have permission to perform this action"
      );
    }

    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!service) {
      return response.notFound(
        res,
        `The service with id ${req.params.id} was not found.`
      );
    }
    return response.success(res, "Service updated successfully.", { service });
  } catch (err) {
    return response.serverError(
      res,
      "An error occurred while updating the service type."
    );
  }
};

const getAllServiceTypes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not specified
    const limit = parseInt(req.query.limit) || 10; // Default limit to 10 items per page
    const skipIndex = (page - 1) * limit;
    const service = await Service.find()
      .sort({ createdAt: -1 })
      .skip(skipIndex)
      .limit(limit);
    const totalServices = await Service.countDocuments();
    const totalPages = Math.ceil(totalServices / limit);

  //const response = { service, totalPages, currentPage: page }

    const message =
      service.length === 0
        ? "No services found"
        : "services loaded successfully";
    return response.success(res, message, { service, totalPages, totalServices, currentPage: page });
  } catch (error) {
    console.log(error);
    return response.serverError(res, error.message, "Failed to load Services");
  }
};

const deleteServiceType = async (req, res) => {
  try {
    if (req.user.role_id !== ROLE_IDS.ADMIN)
      return response.forbidden(
        res,
        "You don't have permission to perform this action"
      );
    const { id } = req.params;
    
    const isServiceConnected = await User.findOne({ "additional.services": id });

    if (isServiceConnected) {
      return res.status(400).json({ error: "Cannot delete service. It is connected to one or more users." });
    }

    await Service.findByIdAndDelete(id);
    res.json({ message: "Service type deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createServiceType,
  updateServiceType,
  getAllServiceTypes,
  deleteServiceType,
};
// Implement similar controllers for updating, getting all, and deleting service types.