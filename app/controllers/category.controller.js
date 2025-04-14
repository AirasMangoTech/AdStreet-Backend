const Category = require("../models/categories");
const response = require("../utils/responseHelpers");
const { ROLE_IDS } = require("../utils/utility");

const createCategory = async (req, res) => {
  if (req.user.role_id !== ROLE_IDS.ADMIN)
    return response.forbidden(
      res,
      "You don't have permission to perform this action"
    );
  try {
    const { name, imageUrl, type } = req.body;
    const category = new Category({ name, image: req.body.imageUrl, type });
    await category.save();
    return response.success(res, "Category created successfully", { category });
  } catch (error) {
    return response.badRequest(
      res,
      "Already  exists a category with that name."
    );
  }
};
const getAllCategories = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query = { name: { $regex: new RegExp(search, "i") } };
    }
    if (req.query.type) {
      query.type = req.query.type;
    }

    if (req.query.active) {
      query.isActive = req.query.active == "true" ? true : false;
    }

    const page = parseInt(req.query.page) || 1; // Default to page 1 if not specified
    const limit = parseInt(req.query.limit) || 10; // Default limit to 10 items per page
    const skipIndex = (page - 1) * limit;
    const categories = await Category.find(query)
      .sort({ createdAt: -1 })
      .skip(skipIndex)
      .limit(limit);
    const totalCategory = await Category.countDocuments(query);
    const totalPages = Math.ceil(totalCategory / limit);
    // Use a consistent structure for the response
    const message =
      categories.length === 0
        ? "No categories found"
        : "Categories loaded successfully";
    return response.success(res, message, {
      categories,
      totalPages,
      currentPage: page,
      totalCategory,
    });
  } catch (error) {
    console.log(error);
    return response.serverError(
      res,
      error.message,
      "Failed to load Categories"
    );
  }
};

const updateCategory = async (req, res) => {
  try {
    if (req.user.role_id !== ROLE_IDS.ADMIN) {
      return response.forbidden(
        res,
        "You don't have permission to perform this action"
      );
    }
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!category) {
      return response.notFound(
        res,
        `No Category was found with the id of ${req.params.id}`
      );
    }
    return response.success(res, "Category updated successfully.", {
      category,
    });
  } catch (error) {
    response.serverError(
      res,
      error.message,
      `There was an error updating the
    Category with the id of ${req.params.id}`
    );
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return response.notFound(
        res,
        `No Category was found with the id of ${req.params.id}`
      );
    }
    response.success(res, "The Category has been deleted successfully");
  } catch (error) {
    response.serverError(
      res,
      error.message,
      `There was a problem deleting the Category
    with the id of ${req.params.id}`
    );
  }
};

const updateCategorySequence = async (req, res) => {
  try {
    const { categories } = req.body;

    if (!Array.isArray(categories) || categories.length === 0) {
      return response.badRequest(
        res,
        "Categories array is required and cannot be empty"
      );
    }

    const bulkOperations = categories.map((categoryItem) => {
      if (!categoryItem._id || typeof categoryItem.sortOrder !== "number") {
        throw new Error(
          "Each category must have an _id and a numeric sortOrder"
        );
      }

      return {
        updateOne: {
          filter: { _id: categoryItem._id },
          update: { $set: { num_id: categoryItem.sortOrder } },
        },
      };
    });

    await Category.bulkWrite(bulkOperations);

    return response.success(res, "Categories sortation updated successfully");
  } catch (error) {
    console.error(`Error updating categories sortation: ${error}`);
    return response.serverError(res, "Error updating categories sortation");
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  //getCategoryById,
  updateCategory,
  deleteCategory,
  updateCategorySequence,
};
