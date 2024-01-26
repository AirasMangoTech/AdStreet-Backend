const Category = require("../models/categories");
const response = require("../utils/responseHelpers");
//const { admin_role_id } = require("../utils/utility");


const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = new Category({ name });
    await category.save();
    return response.success(res, "Category created successfully", category);
  } catch (error) {

    res.status(500).json({ message: error.message });
    return response.forbidden(res, "Only admin can access")
  }
};


const getAllCategories = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query = { name: { $regex: new RegExp(search, "i") } };
    }

    const categories = await Category.find(query);

    if (categories.length === 0) {
      return response.notFound(
        res,
        "No categories found based on the search criteria"
      );
    }

    res.json(categories);
  } catch (error) {
    console.log(error);
    return response.serverError(
      res,
      error.message,
      "Failed to load Categories"
    );
  }
};

const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return response.notFound(
        res,
        `No Category found with the id of ${req.params.id}`
      );
    }
    res.json(category);
  } catch (error) {
    response.badRequest(
      res,
      error.message,
      `Invalid request for getting Category by Id
    with the value of ${req.params.id}`
    );
  }
};

const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!category) {
      return response.notFound(
        res,
        `No Category was found with the id of ${req.params.id}`
      );
    }
    res.json(category);
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

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
