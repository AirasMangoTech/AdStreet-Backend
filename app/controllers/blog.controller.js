const Blog = require("../models/blogs");
const BlogCategory = require("../models/blogCategory");
const Category = require("../models/categories");
const response = require("../utils/responseHelpers");
const { ROLE_IDS } = require("../utils/utility");
const mongoose = require("mongoose");

const createBlog = async (req, res) => {
  try {
    const { title, content, date, categoryId, additional } = req.body;
    // const blogCategory = await BlogCategory.findById(blogId);
    // if (!blogCategory) {
    //   return response.notFound(res, "Invalid Category Id");
    // }
    const category = await Category.findById(categoryId);
    if (!category) {
      return response.notFound(res, "Invalid Category Id");
    }

    const isApproved = req.user.role_id === ROLE_IDS.ADMIN; // Auto-approve if admin

    const blog = new Blog({
      title,
      content,
      date,
      image: req.body.imageUrl,
      //blogCategory: blogId,
      category: categoryId,
      additional: additional ? additional : null,
      isApproved: isApproved, // Set based on the user's role
    });

    await blog.save();
    const message = isApproved
      ? "Blog created and approved successfully"
      : "Blog created and pending approval";
    return response.success(res, message, { blog });
  } catch (error) {
    return response.serverError(res, error.message, "Failed to create blog");
  }
};

const getAllBlogs = async (req, res) => {
  try {
    let query = {};
    if (req.query.category !== undefined) {
      const categories = req.query.category.split(",");
      const categoryObjectIDs = categories.map(
        (category) => new mongoose.Types.ObjectId(category)
      );
      query.category = { $in: categoryObjectIDs };
    }
    if (req.query.title) {
      query.title = { $regex: new RegExp(req.query.title, "i") };
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skipIndex = (page - 1) * limit;

    const blogs = await Blog.find(query)
      .populate("category")
      .sort({ createdAt: -1 })
      .skip(skipIndex)
      .limit(limit);
    const totalBlogs = await Blog.countDocuments(query);
    const totalPages = Math.ceil(totalBlogs / limit);

    return response.success(res, "All blogs retrieved successfully", {
      blogs,
      pageInfo: {
        currentPage: page,
        totalPages,
        totalBlogs,
        limit,
      },
    });
  } catch (error) {
    console.error(`Error getting all blogs: ${error}`);
    return response.authError(res, "something bad happened");
  }
};

const updateBlog = async (req, res) => {
  try {
    const { title, content, categoryId } = req.body;
    const blogId = req.params.id;

    // Optional: Check if the category exists
    // if (categoryId) {
    //   const category = await BlogCategory.findById(categoryId);
    //   if (!category) {
    //     return response.notFound(res, "Invalid Category Id");
    //   }
    // }

    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      {
        title,
        content,
        category: categoryId,
      },
      { new: true }
    );

    if (!updatedBlog) {
      return response.notFound(res, "Blog not found");
    }

    return response.success(res, "Blog updated successfully", { updatedBlog });
  } catch (error) {
    return response.serverError(res, error.message, "Failed to update blog");
  }
};

const deleteBlog = async (req, res) => {
  try {
    const blogId = req.params.id;
    const deletedBlog = await Blog.findByIdAndDelete(blogId);

    if (!deletedBlog) {
      return response.notFound(res, "Blog not found");
    }

    return response.success(res, "Blog deleted successfully", { deletedBlog });
  } catch (error) {
    return response.serverError(res, error.message, "Failed to delete blog");
  }
};

module.exports = {
  createBlog,
  getAllBlogs,
  updateBlog,
  deleteBlog,
};
