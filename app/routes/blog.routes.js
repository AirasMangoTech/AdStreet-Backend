const express = require("express");
const blog_router = express.Router();
const verifyToken = require("../middleware/auth");
const blogCategory = require("../controllers/blogCategories.controller");
const blog = require("../controllers/blog.controller");
const interest = require("../controllers/interest.controller");


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

// these routes are for interest

blog_router.post("/toggleinterest/:blogId", [verifyToken], interest.toggleInterest);
blog_router.get("/gettoggleInterest/:blogId", [verifyToken], interest.gettoggleInterest);

// these routes are for website
blog_router.get('/getallblogsWEB', blog.getAllBlogsWEB);

blog_router.patch("/updateBlogSequence", [verifyToken], blog.updateBlogSequence)

module.exports = blog_router;
