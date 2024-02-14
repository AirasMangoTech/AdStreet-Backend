const Blog = require("../models/blogs");
const BlogCategory = require("../models/blogCategory");
const Category = require("../models/categories");
const response = require("../utils/responseHelpers");
const {ROLE_IDS} = require('../utils/utility');

const createBlog = async (req, res) => {
  if (req.user.role_id !== ROLE_IDS.ADMIN)
    return response.forbidden(
      res,
      "You don't have permission to perform this action"
    );
  try {
    const { title, content, blogId, category } = req.body;
    const blogcategory = await BlogCategory.findById(blogId);
    if (!blogcategory) {
        return response.notFound(res, "Invalid Category Id");
    }
    const categoryId = await Category.findById(blogId);
    if (!categoryId) {
        return response.notFound(res, "Invalid Category Id");
    }

    const blog = new Blog({
      title,
      content,
      blogcategory: blogId,
      categoryId: category
    });

    await blog.save();
    return response.success(res, "Blog created successfully", {blog});
  } catch (error) {
    return response.serverError(
      res,
      error.message,
      "Failed to load Categories"
    );
  }
};

// const getAllBlogs = async (req, res) => {
//   try {
//     const blogs = await Blog.find().populate('category', 'name');
//     return response.success(res, "Blogs retrieved successfully", blogs);
//   } catch (error) {
//     return response.serverError(res, error.message, "Failed to retrieve blogs");
//   }
// };

const getAllBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; 
    const limit = parseInt(req.query.limit) || 10; 

    const skipIndex = (page - 1) * limit;

    const blogs = await Blog.find()
      .sort({ createdAt: -1 }) 
      .skip(skipIndex)
      .limit(limit);

    const totalBlogs = await Blog.countDocuments(); 
    const totalPages = Math.ceil(totalBlogs / limit); 

    res.status(200).json({
      data: blogs,
      pageInfo: {
        currentPage: page,
        totalPages,
        totalBlogs,
        limit
      }
    });
  } catch (error) {
    return response.authError(res, "something bad happened");
  }
};


const updateBlog = async (req, res) => {
  try {
    const { title, content, categoryId } = req.body;
    const blogId = req.params.id;

    // Optional: Check if the category exists
    if (categoryId) {
      const category = await BlogCategory.findById(categoryId);
      if (!category) {
        return response.notFound(res, "Invalid Category Id");
      }
    }

    const updatedBlog = await Blog.findByIdAndUpdate(blogId, {
      title,
      content,
      category: categoryId
    }, { new: true });

    if (!updatedBlog) {
      return response.notFound(res, "Blog not found");
    }

    return response.success(res, "Blog updated successfully", {updatedBlog});
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

    return response.success(res, "Blog deleted successfully", {deletedBlog});
  } catch (error) {
    return response.serverError(res, error.message, "Failed to delete blog");
  }
};


module.exports = {
  createBlog,
  getAllBlogs,
  updateBlog,
  deleteBlog,
}

