const Blog = require("../models/blogs");
const BlogCategory = require("../models/blogCategory");
const Category = require("../models/categories");
const response = require("../utils/responseHelpers");
const { ROLE_IDS } = require("../utils/utility");
const mongoose = require("mongoose");
const Users = require("../models/users");
const FcmToken = require("../models/fcmTokens");
const Notification = require("../models/notifications");
const sendNotification = require("../utils/sendNotifications");

const createBlog = async (req, res) => {
  try {
    const { title, content, date, time, category, type, budget, event_type, additional } = req.body;
    // const blogCategory = await BlogCategory.findById(blogId);
    // if (!blogCategory) {
    //   return response.notFound(res, "Invalid Category Id");
    // }
    const categoryId = await Category.findById(category);
    if (!categoryId) {
      return response.notFound(res, "Invalid Category Id");
    }

    const isApproved = req.user.role_id === ROLE_IDS.ADMIN; // Auto-approve if admin
    const status = req.user.role_id === ROLE_IDS.ADMIN;

    const blog = new Blog({
      title,
      content,
      date,
      time,
      type,
      user_id: req.user.id,
      image: req.body.image,
      category: categoryId,
      additional: additional ? additional : null,
      isApproved: isApproved,
      status, // Set based on the user's role
      budget,
      event_type,
      offered_by: req.body.offered_by,
      venue: req.body.venue,
    });

    await blog.save();

    const notiTitle = 'New Blog';
    const notiDescription = req.user.name + ' posted a new blog';

    let notiData = {
      id: blog.id,
      pagename: type,
      title: notiTitle,
      body: notiDescription
    };

    const admins = await Users.find({ roles: 'ADMIN' }).select('_id');
    if (admins.length > 0) {
      const adminIds = admins.map(admin => admin._id);
      if(adminIds.length > 0)
        {
          const notifications = adminIds.map(adminId => ({
            title: notiTitle,
            content: notiDescription,
            icon: "check-box",
            data: JSON.stringify(notiData),
            user_id: adminId,
          }));

          await Notification.insertMany(notifications);

          const tokens = await FcmToken.find({ user_id: { $in: adminIds } }).select('token');
  
          if (tokens.length > 0) {
            const tokenList = tokens.map(tokenDoc => tokenDoc.token);
  
            if (tokenList.length > 0) {
              await sendNotification(
                notiTitle,
                notiDescription,
                notiData,
                tokenList
              );
            }
  
          }

        }
    }

    const message = isApproved
      //? "Blog created and approved successfully"
      ? "Your blog has been approved."
      : "You will be notified once your blog has been approved.";
    return response.success(res, message, { blog });
  } catch (error) {
    console.error(error); // Logging the error for debugging
    return response.serverError(res, error.message, "Failed to create blog");
  }
};

// const createBlog = async (req, res) => {
//   try {
//     const { title, content, date, categoryId, additional, imageUrl } = req.body;

//     // Sanitize the content
//     const cleanContent = sanitizeHtml(content, {
//       allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']), // Add any additional tags you want to allow
//       allowedAttributes: {
//         ...sanitizeHtml.defaults.allowedAttributes,
//         'img': ['src', 'alt'], // Allow image source and alternative text
//       },
//       // Additional options can be configured as needed
//     });

//     const category = await Category.findById(categoryId);
//     if (!category) {
//       return response.notFound(res, "Invalid Category Id");
//     }

//     const isApproved = req.user.role_id === ROLE_IDS.ADMIN; // Auto-approve if admin

//     const blog = new Blog({
//       title,
//       content: cleanContent, // Use sanitized content
//       date,
//       image: imageUrl, // Assuming imageUrl is properly validated
//       category: categoryId,
//       additional: additional ? additional : null,
//       isApproved: isApproved,
//     });

//     await blog.save();
//     const message = isApproved
//       ? "Blog created and approved successfully"
//       : "Blog created and pending approval";
//     return response.success(res, message, { blog });
//   } catch (error) {
//     console.error(error); // Logging the error for debugging
//     return response.serverError(res, "Failed to create blog", error.message);
//   }
// };


// const getAllBlogs = async (req, res) => {
//   try {
//     let query = {};
//     if (req.query.category !== undefined) {
//       const categories = req.query.category.split(",");
//       const categoryObjectIDs = categories.map(
//         (category) => new mongoose.Types.ObjectId(category)
//       );
//       query.category = { $in: categoryObjectIDs };
//     }
//     if (req.query.title) {
//       query.title = { $regex: new RegExp(req.query.title, "i") };
//     }
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skipIndex = (page - 1) * limit;

//     const blogs = await Blog.find(query)
//       .populate("category")
//       .sort({ createdAt: -1 })
//       .skip(skipIndex)
//       .limit(limit);
//     const totalBlogs = await Blog.countDocuments(query);
//     const totalPages = Math.ceil(totalBlogs / limit);

//     return response.success(res, "All blogs retrieved successfully", {
//       blogs,
//       pageInfo: {
//         currentPage: page,
//         totalPages,
//         totalBlogs,
//         limit,
//       },
//     });
//   } catch (error) {
//     console.error(`Error getting all blogs: ${error}`);
//     return response.authError(res, "something bad happened");
//   }
// };

// const updateBlog = async (req, res) => {
//   try {
//     const { title, content, categoryId } = req.body;
//     const blogId = req.params.id;

//     const updatedBlog = await Blog.findByIdAndUpdate(
//       blogId,
//       {
//         title,
//         content,
//         category: categoryId,
//       },
//       { new: true }
//     );
//     if (!updatedBlog) {
//       return response.notFound(res, "Blog not found");
//     }
//     return response.success(res, "Blog updated successfully", { updatedBlog });
//   } catch (error) {
//     return response.serverError(res, error.message, "Failed to update blog");
//   }
// };

const getAllBlogs = async (req, res) => {
  try {
    let query = { status: true };

    const userId = req.user.id;

    if (req.query.id) {
      query._id = new mongoose.Types.ObjectId(req.query.id);
    }
   
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
    if (req.query.type) {
      query.type = { $regex: new RegExp(req.query.type, "i") };
    }

    if (req.query.event_type) {
      query.event_type = { $regex: new RegExp(req.query.event_type, "i") };
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skipIndex = (page - 1) * limit;

    // Modify this part to include aggregation for counting interested users
    const blogsAggregate = await Blog.aggregate([
      { $match: query },
      {
        "$lookup": {
          "from": "interests",
          "let": { "blogId": "$_id" },
          "pipeline": [
            { 
              "$match": { 
                "$expr": { 
                  "$and": [ 
                    { "$eq": ["$blog", "$$blogId"] }, 
                    { "$eq": ["$expressedInterest", true] }
                  ] 
                } 
              } 
            },
            { 
              "$group": { 
                "_id": "$blog", 
                "interestCount": { "$sum": 1 }
              } 
            }
          ],
          "as": "interestData"
        }
      },
      
      // Debug: Add interestData field to see its content
      { $addFields: { debugInterestData: "$interestData" } },
      
      // Second lookup: Check if the specific user expressed interest
      {
        "$lookup": {
          "from": "interests",
          "let": { "blogId": "$_id", "userId": userId },  // Pass userId explicitly
          "pipeline": [
            { 
              "$match": { 
                "$expr": { 
                  "$and": [ 
                    { "$eq": ["$blog", "$$blogId"] }, 
                    { "$eq": ["$user", "$$userId"] },  // Use $$userId
                    //{ "$eq": ["$expressedInterest", true] }
                  ] 
                } 
              } 
            },
            { 
              "$limit": 1 // Only need to know if there's at least one match
            }
          ],
          "as": "userInterestData"
        }
      },
      
      // Debug: Add userInterestData field to see its content
      { $addFields: { debugUserInterestData: "$userInterestData" } },
      
      // Add calculated fields
      {
        $addFields: {
          interestCount: { $ifNull: [{ $arrayElemAt: ["$interestData.interestCount", 0] }, 0] },
          expressedInterest: { $cond: { if: { $gt: [{ $size: "$userInterestData" }, 0] }, then: true, else: false } }
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skipIndex },
      { $limit: limit },
      {
        $lookup: {
          from: "categories", 
          localField: "category",
          foreignField: "_id",
          as: "category"
        }
      },
    ]);
    
    // blogsAggregate.forEach(blog => {
    //   delete blog.interestData;
    //   delete blog.userInterestData;
    // });
    

    const totalBlogs = await Blog.countDocuments(query);
    const totalPages = Math.ceil(totalBlogs / limit);

    return response.success(res, "All blogs retrieved successfully", {
      blogs: blogsAggregate,
      pageInfo: {
        currentPage: page,
        totalPages,
        totalBlogs,
        limit,
      },
    });
  } catch (error) {
    console.error(`Error getting all blogs: ${error}`);
    return response.authError(res, "Something bad happened" + error);
  }
};

const getAllBlogsWEB = async (req, res) => {
  try {
    let query = { status: true };


    if (req.query.id) {
      query._id = new mongoose.Types.ObjectId(req.query.id);
    }
   
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
    if (req.query.type) {
      query.type = { $regex: new RegExp(req.query.type, "i") };
    }

    if (req.query.event_type) {
      query.event_type = { $regex: new RegExp(req.query.event_type, "i") };
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skipIndex = (page - 1) * limit;

    // Modify this part to include aggregation for counting interested users
    const blogsAggregate = await Blog.aggregate([
      { $match: query },
      {
        "$lookup": {
          "from": "interests",
          "let": { "blogId": "$_id" },
          "pipeline": [
            { 
              "$match": { 
                "$expr": { 
                  "$and": [ 
                    { "$eq": ["$blog", "$$blogId"] }, 
                    { "$eq": ["$expressedInterest", true] }
                  ] 
                } 
              } 
            },
            { 
              "$group": { 
                "_id": "$blog", 
                "interestCount": { "$sum": 1 } 
              } 
            }
          ],
          "as": "interestData"
        }
      },      
      {
        $addFields: {
          interestCount: { $ifNull: [{ $arrayElemAt: ["$interestData.interestCount", 0] }, 0] }
        }
      },
      {
        $addFields: {
          // Projecting the interest boolean value
          expressedInterest: { $cond: { if: { $gt: ["$interestCount", 0] }, then: true, else: false } }
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skipIndex },
      { $limit: limit },
      {
        $lookup: {
          from: "categories", 
          localField: "category",
          foreignField: "_id",
          as: "category"
        }
      },
    ]);
    
    blogsAggregate.forEach(blog => delete blog.interestData);
    

    const totalBlogs = await Blog.countDocuments(query);
    const totalPages = Math.ceil(totalBlogs / limit);

    return response.success(res, "All blogs retrieved successfully", {
      blogs: blogsAggregate,
      pageInfo: {
        currentPage: page,
        totalPages,
        totalBlogs,
        limit,
      },
    });
  } catch (error) {
    console.error(`Error getting all blogs: ${error}`);
    return response.authError(res, "Something bad happened");
  }
};

const updateBlog = async (req, res) => {
  try {
    const categoryId = req.params.id;

    const updatedBlog = await Blog.findByIdAndUpdate(
      categoryId,
      req.body, 
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
  getAllBlogsWEB,
  updateBlog,
  deleteBlog,
};
