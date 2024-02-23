const BlogCategory = require("../models/blogCategory");
const response = require("../utils/responseHelpers");
const { ROLE_IDS } = require("../utils/utility");

const createBlogCategory = async (req, res) => {
  if (req.user.role_id !== ROLE_IDS.ADMIN)
    return response.forbidden(
      res,
      "You don't have permission to perform this action"
    );
  try {
    const { name, description, imageUrl } = req.body;

    const Category_blog = new BlogCategory({
      name,
      description,
      image: imageUrl,
    });

    await Category_blog.save();
    return response.success(res, "The blog is successfully created", {
      Category_blog,
    });
  } catch (error) {
    console.log(error.message);
    return response.serverError(res, "Something bad happended try again aaaaaaaaa");
  }
};

const getAllBlogCategories = async (req, res) => {
        try {
          const categories = await BlogCategory.find();
          return response.success(res,"Successfully fetched all the blogs.",{categories});
        } catch (error) {
          return response.serverError(res, error.message);
        }
      };
      
const updateBlogCategory = async (req, res) => {
  try {
    const updatedCategory = await BlogCategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedCategory) {
      return response.notFound(res, "This blog category does not exist.");
    }
    return response.success(res, "The blog category has been succesfully updated.", {
      updatedCategory,
    });
  } catch (error) {
        console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

const deleteBlogCategory = async (req, res) => {
  try {
    const category = await BlogCategory.findByIdAndRemove(req.params.id);
    if (!category) {
      return response.notFound(res, "Blog category not found.");
    }
    return response.success(res, "Blog category deleted successfully");
  } catch (error) {
    return response.badRequest(res, error.message);
  }
};

module.exports = {
  createBlogCategory,
  getAllBlogCategories,
  updateBlogCategory,
  deleteBlogCategory,
};
