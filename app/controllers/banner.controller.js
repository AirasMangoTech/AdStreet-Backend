const Banner = require("../models/banner");
const Blog = require("../models/blogs");
const response = require("../utils/responseHelpers");
const mongoose = require("mongoose");

// Create and Save a new Banner
const createBanner = async (req, res) => {
  try {
    if (!req.body.imageUrl) {
      return response.badRequest(res, "Banner content can not be empty");
    }
    if (req.body.eventName) {
      const eventName = req.body.eventName
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-");
      req.body.url = `https://adstreet.com.pk/form?event=${eventName}`;
      req.body.eventName = eventName;
      if (req.body.blogId) {
        const blog = await Blog.findById(req.body.blogId);
        if (!blog)
          return response.badRequest(res, "No blog exists with that ID.");
        req.body.blogUrl = `/${eventName}-blog/${req.body.blogId}`;
      }
    }
    const banner = new Banner(req.body);
    await banner.save();
    return response.success(res, "Banner created successfully", { banner });
  } catch (err) {
    console.log(err);
    return response.serverError(res, `Error creating banner: ${err}`);
  }
};

const getAllBanners = async (req, res) => {
  try {
    let query = {};
    if (req.query.type) {
      query.type = req.query.type.toLowerCase(); // Ensure type matches schema's lowercase requirement
    }

    const userId = req.user.id;

    // Fetch banners and populate the related blog
    const banners = await Banner.find(query).populate("blog").lean();

    const modifiedBanners = await Promise.all(
      banners.map(async (banner) => {
        if (banner.blog) {
          const blogId = banner.blog._id;

          // Perform the aggregation only if the blog exists
          const [blogData] = await Blog.aggregate([
            { $match: { _id: blogId } },
            {
              $lookup: {
                from: "interests",
                let: { blogId: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$blog", "$$blogId"] },
                          { $eq: ["$expressedInterest", true] },
                        ],
                      },
                    },
                  },
                  {
                    $group: {
                      _id: "$blog",
                      interestCount: { $sum: 1 },
                    },
                  },
                ],
                as: "interestData",
              },
            },
            {
              $lookup: {
                from: "interests",
                let: { blogId: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$blog", "$$blogId"] },
                          {
                            $eq: ["$user", new mongoose.Types.ObjectId(userId)],
                          },
                          { $eq: ["$expressedInterest", true] },
                        ],
                      },
                    },
                  },
                  { $limit: 1 },
                ],
                as: "userInterestData",
              },
            },
            {
              $addFields: {
                interestCount: {
                  $ifNull: [
                    { $arrayElemAt: ["$interestData.interestCount", 0] },
                    0,
                  ],
                },
                expressedInterest: {
                  $cond: {
                    if: { $gt: [{ $size: "$userInterestData" }, 0] },
                    then: true,
                    else: false,
                  },
                },
              },
            },
          ]);

          // Merge aggregated fields into the banner object
          return {
            ...banner,
            blogId: {
              ...banner.blog,
              interestCount: blogData?.interestCount || 0,
              expressedInterest: blogData?.expressedInterest || false,
            },
            blog: undefined, // Optionally remove the original blog field
          };
        } else {
          // If no blog, return banner with blogId set to null
          return {
            ...banner,
            blogId: null,
            blog: undefined,
          };
        }
      })
    );

    // Filter results based on `isActive` if necessary (based on schema)
    const activeBanners = modifiedBanners.filter((banner) => banner.isActive);

    return response.success(res, "Banners retrieved successfully", {
      banners: modifiedBanners,
    });
  } catch (err) {
    console.error(err);
    return response.serverError(
      res,
      `Error retrieving banners: ${err.message}`
    );
  }
};

const getBanner = async (req, res) => {
  try {
    const { eventName } = req.query;
    if (!eventName)
      return response.badRequest(res, "Event name cannnot be empty.");

    const event = await Banner.findOne({ eventName });
    if (!event) return response.notFound(res, "Banner not found");

    return response.success(res, "Banner retrieved successfully", {
      event,
    });
  } catch (e) {
    console.log(e);
    return response.serverError(res, `Error retrieving banner: ${e.message}`);
  }
};

// Retrieve all Banners from the database.
const getAllWebBanners = async (req, res) => {
  try {
    let query = {};
    if (req.query.type) {
      query.type = req.query.type;
    }
    const banners = await Banner.find(query).populate("blog").lean();

    const modifiedBanners = banners.map((banner) => {
      return {
        ...banner,
        blogId: banner.blog, // Assign the blog data to blogId
        blog: undefined, // Remove the original blog field
      };
    });

    return response.success(res, "Banners retrieved successfully", {
      banners: modifiedBanners,
    });
  } catch (err) {
    console.log(err);
    return response.serverError(res, `Error retrieving banners: ${err}`);
  }
};

//update banner
const updateBanner = async (req, res) => {
  try {
    const bannerId = req.params.id;
    const banner = await Banner.findByIdAndUpdate(bannerId, req.body, {
      new: true, //return updated user document
    });
    if (!banner) {
      return response.notFound(res, "Banner not found");
    }
    return response.success(res, "Banner updated successfully", { banner });
  } catch (err) {
    console.log(err);
    return response.serverError(res, `Error updating banner: ${err}`);
  }
};
// delete banner
const deleteBanner = async (req, res) => {
  try {
    const bannerId = req.params.id;
    const banner = await Banner.findByIdAndDelete(bannerId);
    if (!banner) {
      return response.notFound(res, "Banner not found");
    }
    return response.success(res, "Banner deleted successfully");
  } catch (err) {
    console.log(err);
    return response.serverError(res, `Error deleting banner: ${err}`);
  }
};

module.exports = {
  createBanner,
  getAllBanners,
  getAllWebBanners,
  updateBanner,
  getBanner,
  deleteBanner,
};
