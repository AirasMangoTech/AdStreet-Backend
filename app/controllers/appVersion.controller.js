const AppVersion = require("../models/appVersion");
const response = require("../utils/responseHelpers");

const createVersion = async (req, res) => {
  try {
    const version = new AppVersion(req.body);
    await version.save();
    response.success(res, "Version created successfully.", {
      version,
    });
  } catch (error) {
    console.error("Error creating version", error);
    response.error(res, "Failed to create version.", error.message);
  }
};

const getAllVersions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "asc",
      platform,
      version,
    } = req.query;
    const filter = {};

    if (platform) {
      filter.platform = platform;
    }

    if (version) {
      filter.version = version;
    }

    const versions = await AppVersion.find(filter)
      .sort({ [sortBy]: order === "asc" ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await AppVersion.countDocuments(filter);

    res.status(200).json({ total, versions });
  } catch (error) {
    console.error("Error fetching versions", error);
    res.status(500).json("Server error");
  }
};

const updateVersion = async (req, res) => {
  try {
    const version = await AppVersion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!version) {
      return response.error(
        res,
        "Version not found.",
        "No version found with the given ID."
      );
    }
    response.success(res, "Version updated successfully.", { version });
  } catch (error) {
    console.error("Error updating version", error);
    response.error(res, "Failed to update version.", error.message);
  }
};

const deleteVersion = async (req, res) => {
  try {
    const version = await AppVersion.findByIdAndDelete(req.params.id);
    if (!version) {
      return response.error(
        res,
        "Version not found.",
        "No version found with the given ID."
      );
    }
    response.success(res, "Version deleted successfully.");
  } catch (error) {
    console.error("Error deleting version", error);
    response.error(res, "Failed to delete version.", error.message);
  }
};

module.exports = {
  createVersion,
  getAllVersions,
  updateVersion,
  deleteVersion,
};
