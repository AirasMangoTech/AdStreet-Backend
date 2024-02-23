const express = require("express");
const blog_router = express.Router();
const verifyToken = require("../middleware/auth");
const blogCategory = require("../controllers/blogCategories.controller");
const blog = require("../controllers/blog.controller")
const { upload } = require("../utils/imageUpload");

// these routes are for blog categories

blog_router.post("/createblog", [verifyToken], blogCategory.createBlogCategory);
blog_router.get("/getallblog", [verifyToken], blogCategory.getAllBlogCategories);
blog_router.put("/updateblog/:id", [verifyToken], blogCategory.updateBlogCategory);
blog_router.delete("/deleteblog/:id", [verifyToken], blogCategory.deleteBlogCategory);

// these routes are for blog 

blog_router.post("/blog", [verifyToken], blog.createBlog);
blog_router.get('/getallblogs', [verifyToken], blog.getAllBlogs);
blog_router.put('/updateblogs/:id', [verifyToken], blog.updateBlog);
blog_router.delete('/deleteblogs/:id', [verifyToken], blog.deleteBlog);

module.exports = blog_router;
