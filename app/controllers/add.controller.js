const Ad = require("../models/ad");
const Proposal = require("../models/proposals");
const Notification = require("../models/notifications");
const AdResponse = require("../models/responseAd");
const AdPermission = require("../models/adPermission");
const Users = require("../models/users");
const sendNotification = require("../utils/sendNotifications");
const FcmToken = require("../models/fcmTokens");
const response = require("../utils/responseHelpers");
const { ROLE_IDS } = require("../utils/utility");
const mongoose = require("mongoose");
const moment = require("moment");
const wallet = require("../models/wallet");
const paymentMethod = require("../models/paymentMethod");
const escrowAccount = require("../models/escrowAccount");
const onholdAds = require("../models/onholdAds");
const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = async (filePath, mimeType) => {
  try {
    let resourceType = "raw";

    if (mimeType.startsWith("image/")) {
      resourceType = "image";
    } else if (mimeType.startsWith("video/")) {
      resourceType = "video";
    }

    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: resourceType,
    });

    return result;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw error;
  }
};

const postAd = async (req, res) => {
  if (!req.user) {
    return response.forbidden(res, "User not authenticated", user);
  }

  // const user = await Users.findById(req.user.id);
  // if (
  //   !user ||
  //   (req.user.role_id !== ROLE_IDS.BRAND_COMPANY &&
  //     req.user.role_id !== ROLE_IDS.AGENCY)
  // ) {
  //   return response.forbidden(
  //     res,
  //     "Only users with the role of company or agency can post Ads",
  //     403
  //   );
  // }

  try {
    const {
      title,
      category,
      description,
      budget,
      jobDuration,
      imageUrl,
      links,

      valid_till,
      featured,
    } = req.body;
    //const image = req.file.path; // Assuming file paths are sent from the frontend and you're using a middleware like multer for file handling

    const paymentMethodStatus = await paymentMethod.findOne();
    let paymentstatus = false;

    if (!paymentMethodStatus) {
      let pmstatus = new paymentMethod({
        isMandatory: paymentstatus,
      });
      await pmstatus.save();
    } else {
      paymentstatus = paymentMethodStatus.isMandatory;
    }

    const newAd = new Ad({
      title,
      category,
      image: req.body.imageUrl,
      links,
      description,
      budget,
      jobDuration,
      postedBy: req.user.id,
      valid_till,
      featured,
      isActivated: !paymentstatus,
    });

    await newAd.save();

    const postedBy = req.user.name;

    const notiTitle = "New Job";
    const notiDescription = postedBy + " posted a new job";

    let notiData = {
      id: newAd.id,
      pagename: "",
      title: notiTitle,
      body: notiDescription,
    };

    const admins = await Users.find({ roles: "ADMIN" }).select("_id");
    if (admins.length > 0) {
      const adminIds = admins.map((admin) => admin._id);
      if (adminIds.length > 0) {
        const notifications = adminIds.map((adminId) => ({
          title: notiTitle,
          content: notiDescription,
          icon: "check-box",
          data: JSON.stringify(notiData),
          user_id: adminId,
        }));

        await Notification.insertMany(notifications);

        const tokens = await FcmToken.find({
          user_id: { $in: adminIds },
        }).select("token");

        if (tokens.length > 0) {
          const tokenList = tokens.map((tokenDoc) => tokenDoc.token);

          if (tokenList.length > 0) {
            tokenList.forEach((token) =>
              sendNotification(notiTitle, notiDescription, notiData, token)
            );
          }
        }
      }
    }

    return response.success(res, "Ad posted successfully", { newAd });
  } catch (error) {
    console.error(`Error posting ad: ${error}`);
    return response.serverError(res, "Error posting ad");
  }
};

const getAllAds = async (req, res) => {
  try {
    const currentDate = new Date();
    let query = {
      isExpired: false,
    };

    if (req.query.title) {
      query.title = { $regex: new RegExp(req.query.title, "i") };
    }

    if (
      req.query.user_id &&
      mongoose.Types.ObjectId.isValid(req.query.user_id)
    ) {
      query.postedBy = new mongoose.Types.ObjectId(req.query.user_id);
      delete query.isHired;
      delete query.isCompleted;
    }

    if (req.query.adId && mongoose.Types.ObjectId.isValid(req.query.adId)) {
      query._id = new mongoose.Types.ObjectId(req.query.adId);
    }

    if (req.query.category) {
      const categories = req.query.category
        .split(",")
        .filter(mongoose.Types.ObjectId.isValid);
      if (categories.length) {
        query.category = {
          $in: categories.map((id) => new mongoose.Types.ObjectId(id)),
        };
      }
    }

    if (req.query.isApproved) {
      query.isApproved =
        req.query.isApproved === "true"
          ? true
          : req.query.isApproved === "false"
          ? false
          : null;
    }

    const getStartOfDay = (date) => moment(date).startOf("day").toDate();
    const getEndOfDay = (date) => moment(date).endOf("day").toDate();

    if (req.query.valid_till_from || req.query.valid_till_to) {
      query.valid_till = {};
      if (req.query.valid_till_from)
        query.valid_till.$gte = getStartOfDay(req.query.valid_till_from);
      if (req.query.valid_till_to)
        query.valid_till.$lte = getEndOfDay(req.query.valid_till_to);
    }

    if (req.query.created_at_from || req.query.created_at_to) {
      query.createdAt = {};
      if (req.query.created_at_from)
        query.createdAt.$gte = getStartOfDay(req.query.created_at_from);
      if (req.query.created_at_to)
        query.createdAt.$lte = getEndOfDay(req.query.created_at_to);
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const ads = await Ad.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "proposals",
          localField: "_id",
          foreignField: "adId",
          as: "proposals",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "postedBy",
          foreignField: "_id",
          as: "postedBy",
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          category: 1,
          links: 1,
          description: 1,
          budget: 1,
          jobDuration: 1,
          postedBy: { $arrayElemAt: ["$postedBy", 0] },
          createdAt: 1,
          image: 1,
          featured: 1,
          isApproved: 1,
          isHired: 1,
          isCompleted: 1,
          valid_till: 1,
          totalProposals: { $size: "$proposals" },
          isActivated: 1,
        },
      },
      { $sort: { featured: -1, createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    const totalAds = await Ad.countDocuments(query);
    const totalPages = Math.ceil(totalAds / limit);

    return response.success(res, "All ads retrieved successfully", {
      ads,
      totalAds,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error(`Error fetching ads: ${error.message}`);
    return response.serverError(res, "Error fetching ads");
  }
};

// chnages user applied status to true or false
const GetAdddetails = async (req, res) => {
  try {
    let where = {};
    if (req.query.adId) {
      where._id = new mongoose.Types.ObjectId(req.query.adId);
    }
    const adDetails = await Ad.findOne(where)
      .populate("category")
      .populate("postedBy", "_id name email");

    if (!adDetails) {
      return response.notFound(res, "Ad not found");
    }
    const proposalCount = await Proposal.countDocuments({
      adId: adDetails._id,
    });

    const userId = new mongoose.Types.ObjectId(req.user.id);
    const proposal = await Proposal.findOne({
      submittedBy: userId,
      adId: adDetails._id,
    });

    console.log(proposal);
    // Check if the user has already applied for this proposal
    let userApplied = false;
    if (proposal) {
      userApplied = true;
    }
    // Update ad details to include the 'applied' flag
    const adDetailsWithAppliedFlag = {
      ...{ adDetails },
      applied: userApplied,
      proposalCount: proposalCount,
    };
    return response.success(res, "Ad details retrieved successfully", {
      adDetails: adDetailsWithAppliedFlag,
    });
  } catch (error) {
    console.error(`Error getting ad details: ${error}`);
    return response.serverError(res, "Error getting ad details");
  }
};
// chngaes the status of the proposal to true /false after hiring
const acceptProposal = async (req, res) => {
  try {
    const { adId, proposalId, token } = req.body;
    console.log(req.user);
    const ad = await Ad.findById(adId);
    if (!ad) {
      return response.notFound(res, "Ad not found");
    }

    if (!ad.isMilestoneCreated) {
      return response.badRequest(
        res,
        "Please create the milestone to finalize the job details."
      );
    }

    if (ad.postedBy.toString() !== req.user.id) {
      return response.authError(
        res,
        "Only the creator of the ad can accept proposals"
      );
    }
    if (ad.hired_user) {
      return response.badRequest(
        res,
        "Another proposal cannot be accepted as the ad already has a hired user"
      );
    }

    console.log("Accepting proposal.");

    const proposalToAccept = await Proposal.findByIdAndUpdate(
      proposalId,
      { status: "true" },
      { new: true }
    );

    if (!proposalToAccept) {
      return response.notFound(res, "Proposal not found");
    }
    ad.hired_user = proposalToAccept.submittedBy;
    ad.isHired = true;
    await ad.save();

    let notiTitle = `${req.user.name} has accepted your proposal`;
    let notiDescription = `Your contract with ${req.user.name} has started`;

    let notiData = {
      id: adId,
      pagename: "",
      title: notiTitle,
      body: notiDescription,
    };

    let notification = new Notification({
      title: notiTitle,
      content: notiDescription,
      //type: "Accepted",
      icon: "check-box",
      data: JSON.stringify(notiData),
      user_id: proposalToAccept.submittedBy,
    });

    await notification.save();
    let notiToken = await FcmToken.find({
      user_id: proposalToAccept.submittedBy,
    });
    if (notiToken.length > 0) {
      //const token = notiToken[0];

      const tokenList = notiToken.map((tokenDoc) => tokenDoc.token);

      tokenList.forEach((token) =>
        sendNotification(notiTitle, notiDescription, notiData, token)
      );
    }

    return response.success(res, "Proposal accepted successfully", {
      proposalToAccept,
      hired_user: ad.hired_user,
    });
  } catch (error) {
    console.error(`Error accepting proposal: ${error}`);
    return response.serverError(res, "Error accepting proposal");
  }
};

const getHiredUsersAndAds = async (req, res) => {
  try {
    const userId = req.user.id;

    const ongoingAds = await Ad.find({
      postedBy: userId,
      hired_user: { $exists: true, $ne: null },
      isCompleted: false,
    })
      .populate("hired_user", "-password")
      .populate("category")
      .populate("postedBy", "_id");

    // Find completed ads posted by the current user
    const completedAds = await Ad.find({
      postedBy: userId,
      isCompleted: true,
    })
      .populate("hired_user", "-password")
      .populate("category")
      .populate("postedBy", "_id");

    const ongoingHIREDAds = await Ad.find({
      hired_user: userId,
      //hired_user: { $exists: true, $ne: null },
      isCompleted: false,
    })
      .populate("hired_user", "-password")
      .populate("category")
      .populate("postedBy", "_id");

    // Find completed ads posted by the current user
    const completedHIREDAds = await Ad.find({
      hired_user: userId,
      isCompleted: true,
    })
      .populate("hired_user", "-password")
      .populate("category")
      .populate("postedBy", "_id");

    const hiredUser = await Proposal.find({
      submittedBy: userId,
      status: "true",
      isCompleted: false,
    }).populate("postedBy", "name");

    // Check if any ads are found
    // if (
    //   (!ongoingAds || ongoingAds.length === 0) &&
    //   (!completedAds || completedAds.length === 0)
    // ) {
    //   return response.notFound(res, "No ads found for the user");
    // }

    // Extract hired users from all ongoing ads
    // const hiredUsers = ongoingAds.reduce((users, ad) => {
    //   if (ad.submittedBy) {
    //     users.push(ad.submittedBy);
    //   }
    //   return users;
    // }, []);

    return response.success(res, "Hired users and ads retrieved successfully", {
      ongoingAds,
      completedAds,
      hiredUser,
      ongoingHIREDAds,
      completedHIREDAds,
    });
  } catch (error) {
    console.error(`Error getting hired users and ads: ${error}`);
    return response.serverError(res, "Error getting hired users and ads");
  }
};
const getHiredUser = async (req, res) => {
  try {
    const { userId } = req.user;

    // Check if the logged-in user's ID matches the postedBy field
    const postedByAds = await Ad.find({
      postedBy: userId,
      hired_user: { $exists: true, $ne: null },
    }).populate("hired_user", "-password");

    // Check if the logged-in user's ID matches the hired_user field
    const hiredUserAds = await Ad.find({ hired_user: userId }).populate(
      "postedBy",
      "name"
    );

    let ads;
    if (postedByAds.length > 0) {
      ads = postedByAds;
    } else if (hiredUserAds.length > 0) {
      ads = hiredUserAds;
    } else {
      return response.notFound(res, "No relevant ads found.");
    }

    return response.success(res, "Ads retrieved successfully.", { ads });
  } catch (error) {
    console.error(`Error getting hired user details: ${error}`);
    return response.serverError(res, "Error getting hired user details.");
  }
};

const updateAdStatus = async (req, res) => {
  try {
    const adId = req.query.adId;
    const responseId = req.query.responseId;
    if (!adId) {
      return response.badRequest(res, "Ad ID is required");
    }

    const ad = await Ad.findById(adId).populate("hired_user");

    if (!ad) {
      return response.notFound(res, "Ad not found");
    }

    if (ad.postedBy.toString() !== req.user.id) {
      return response.authError(
        res,
        "Only the creator of the ad can update the status"
      );
    }

    const adResponse = await AdResponse.findById(responseId);

    if (!adResponse) {
      return response.notFound(res, "Response not found");
    }

    if (ad.isCompleted) {
      return response.badRequest(res, "Ad is already marked as completed.");
    }

    ad.response = responseId;
    ad.isCompleted = true;
    await ad.save();

    const isComplete = adResponse.name.toLowerCase().includes("complete");

    let adminNotiTitle;
    let adminNotiDescription;

    if (ad.isCompleted && ad.isActivated && isComplete) {
      adminNotiTitle = "Job Completed";
      adminNotiDescription = "Job status updated to completed";

      const admin = await Users.findOne({ roles: "ADMIN" });
      let admin_wallet = await wallet.findOne({ user: admin._id });
      if (admin_wallet.amount < ad.budget) {
        ad.isCompleted = false;
        ad.response = null;
        await ad.save();
        response.serverError(
          res,
          "There was an error sending amount to employee due to insuffiecient funds. Please contact administration."
        );
      }
      admin_wallet.amount -= ad.budget;
      let user_wallet = await wallet.findOne({ user: ad.hired_user.id });
      user_wallet.amount += ad.budget;
      await user_wallet.save();
      await admin_wallet.save();

      let userEscrow = new escrowAccount({
        adId: ad._id,
        user: ad.hired_user.id,
        amount: ad.budget,
        description: `Amount credited to wallet for completing job - ${ad.title}`,
        type: "credit", // DEPOSIT // WITHDRAW  // REFUND // COMMISSION
      });

      let adminEscrow = new escrowAccount({
        adId: ad._id,
        user: admin._id,
        amount: ad.budget,
        description: `Amount debitted from wallet for transfering funds to ${ad.hired_user.name}`,
        type: "debit", // DEPOSIT // WITHDRAW  // REFUND // COMMISSION
      });

      await adminEscrow.save();
      await userEscrow.save();

      const notiTitle_user = "New funds recieved";
      const notiDescription_user = `Dear Customer, amount of ${ad.budget} recieved from ${req.user.name}`;

      let notiData_user = {
        id: adId,
        pagename: "",
        title: notiTitle_user,
        body: notiDescription_user,
      };

      let notification_user = new Notification({
        title: notiTitle_user,
        content: notiDescription_user,
        icon: "check-box",
        data: JSON.stringify(notiData_user),
        user_id: ad.hired_user.id,
      });
      await notification_user.save();

      let notiTokens_user = await FcmToken.find({ user_id: ad.hired_user.id });

      if (notiTokens_user.length > 0) {
        const tokenList_user = notiTokens_user.map(
          (tokenDoc) => tokenDoc.token
        );

        if (tokenList_user.length > 0) {
          tokenList_user.forEach((token) =>
            sendNotification(notiTitle_user, notiDescription_user, notiData_user, token)
          );
        }
      }
    } else {
      adminNotiTitle = "Job Canceled";
      adminNotiDescription = "Job status updated to canceled";

      const onholdNotiTitle = "Job On Hold";
      const onholdNotiDescription =
        "The employer has marked the job as canceled. The job is now on hold for review by the administration. You will be notified and paid accordingly once the review is complete.";

      const onholdAd = new onholdAds({
        ad: ad._id,
        employer: ad.postedBy,
        employee: ad.hired_user._id,
      });
      await onholdAd.save();

      const onholdNotiData = {
        id: adId,
        pagename: "",
        title: onholdNotiTitle,
        body: onholdNotiDescription,
      };

      const onholdNotifications = [
        {
          title: onholdNotiTitle,
          content: onholdNotiDescription,
          icon: "check-box",
          data: JSON.stringify(onholdNotiData),
          user_id: ad.hired_user._id,
        },
        {
          title: onholdNotiTitle,
          content: onholdNotiDescription,
          icon: "check-box",
          data: JSON.stringify(onholdNotiData),
          user_id: ad.postedBy,
        },
      ];

      await Notification.insertMany(onholdNotifications);

      const onholdTokens = await FcmToken.find({
        user_id: { $in: [ad.hired_user._id, ad.postedBy] },
      }).select("token");

      if (onholdTokens.length > 0) {
        const onholdTokenList = onholdTokens.map((tokenDoc) => tokenDoc.token);

        if (onholdTokenList.length > 0) {
          onholdTokenList.forEach((token) =>
            sendNotification(
              onholdNotiTitle,
              onholdNotiDescription,
              onholdNotiData,
              token
            )
          );
        }
      }
    }

    let notiData = {
      id: adId,
      pagename: "",
      title: adminNotiTitle,
      body: adminNotiDescription,
    };

    const admins = await Users.find({ roles: "ADMIN" }).select("_id");
    if (admins.length > 0) {
      const adminIds = admins.map((admin) => admin._id);
      if (adminIds.length > 0) {
        const notifications = adminIds.map((adminId) => ({
          title: adminNotiTitle,
          content: adminNotiDescription,
          icon: "check-box",
          data: JSON.stringify(notiData),
          user_id: adminId,
        }));

        await Notification.insertMany(notifications);

        const tokens = await FcmToken.find({
          user_id: { $in: adminIds },
        }).select("token");

        if (tokens.length > 0) {
          const tokenList = tokens.map((tokenDoc) => tokenDoc.token);

          if (tokenList.length > 0) {
            tokenList.forEach((token) =>
              sendNotification(
                adminNotiTitle,
                adminNotiDescription,
                notiData,
                token
              )
            );
          }
        }
      }
    }

    return response.success(res, "Ad status updated successfully", {
      ad,
      responseMessage: adResponse.name,
    });
  } catch (error) {
    console.error(`Error updating ad status: ${error}`);
    return response.serverError(res, "Error updating ad status");
  }
};

// function to create response
const createResponse = async (req, res) => {
  try {
    console.log(req.user);
    const { name } = req.body;
    const newResponse = new AdResponse({ name }); // Use a different name for the response object
    await newResponse.save();
    return response.success(res, "Response created successfully", {
      newResponse,
    });
  } catch (error) {
    return response.badRequest(
      res,
      "A response with that name already exists."
    );
  }
};

// get all responses
const getAllResponses = async (req, res) => {
  try {
    const responses = await AdResponse.find();
    return response.success(res, "All responses retrieved successfully", {
      responses,
    });
  } catch (error) {
    console.log(error);
    return response.serverError(res, "Failed to load responses");
  }
};

// const updateFeatureStatus = async (req, res) => {
//   try {
//     const { adId } = req.body;

//     const ad = await Ad.findById(adId);
//     if (!ad) {
//       return response.notFound(res, "Ad not found");
//     }

//     ad.featured = true;
//     await ad.save();

//     return response.success(res, "Feature status updated successfully", {
//       ad,
//     });
//   } catch (error) {
//     console.error(`Error updating feature status: ${error}`);
//     return response.serverError(res, "Error updating feature status");
//   }
// };

const updateFeatureStatus = async (req, res) => {
  try {
    const { adId } = req.query; // Extract adId from query parameters
    const { featured } = req.body; // Extract featured from request body

    const ad = await Ad.findById(adId);
    if (!ad) {
      return response.notFound(res, "Ad not found");
    }

    ad.featured = featured; // Update featured status
    await ad.save();

    return response.success(res, "Feature status updated successfully", {
      ad,
    });
  } catch (error) {
    console.error(`Error updating feature status: ${error}`);
    return response.serverError(res, "Error updating feature status");
  }
};

const getPermissions = async (req, res) => {
  try {
    let query = {};
    if (req.query.role) {
      query.role = req.query.role;
    }
    const permission = await AdPermission.find(query);
    if (!permission) {
      return response.notFound(res, "Permission not found");
    }

    return response.success(res, "Permission details retrieved successfully", {
      permission,
    });
  } catch (error) {
    console.error(`Error getting all ads: ${error}`);
    return response.serverError(res, "Error getting all ads");
  }
};

const updatePermissions = async (req, res) => {
  try {
    const { role, isPost, isApply } = req.body;

    if (!role) {
      return response.notFound(res, "role not found");
    }

    const permission = await AdPermission.findOne({ role: role });
    if (!permission) {
      return response.notFound(res, "Permission not found");
    }

    permission.isPost = isPost;
    permission.isApply = isApply;
    permission.save();

    return response.success(res, "Permission updated successfully", {
      permission,
    });
  } catch (error) {
    console.error(`Error getting all ads: ${error}`);
    return response.serverError(res, "Error getting all ads");
  }
};

// MILESTONE CREATION - EMPLOYER
const createMilestone = async (req, res) => {
  try {
    const id = req.query.adId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return response.badRequest(res, "Invalid ad ID.");
    }

    req.body.isMilestoneCreated = true;

    const ad = await Ad.findById(id);

    if (!ad) {
      return response.notFound(
        res,
        "No ad found with that ID to create milestone."
      );
    }

    if (ad.postedBy.toString() !== req.user.id) {
      return response.authError(
        res,
        "Only the creator of the ad can create milestone."
      );
    }

    if (ad.isHired) {
      return response.badRequest(
        res,
        "The employee for this ad is already hired. Cannot create milestone."
      );
    }

    const updatedAd = await Ad.findByIdAndUpdate(id, req.body, {
      runValidators: true,
      new: true,
    });

    if (!updatedAd) {
      return response.serverError(
        res,
        "Failed to create milestone. Please try again."
      );
    }

    return response.success(res, "Milestone created.", updatedAd);
  } catch (error) {
    console.error(`Error creating milestone: ${error.message}`);
    return response.serverError(
      res,
      "An error occurred while creating the milestone."
    );
  }
};

// COMPLETE JOB BUTTON HANDLER - EMPLOYEE
const completeJobByEmployee = async (req, res) => {
  try {
    const adId = req.query.adId;

    if (!mongoose.Types.ObjectId.isValid(adId)) {
      return response.badRequest(res, "Invalid ad ID.");
    }

    const ad = await Ad.findById(adId);

    if (!ad) {
      return response.notFound(res, "No ad found with the provided ID.");
    }

    const employee = req.user;

    if (!ad.isHired || ad.hired_user.toString() !== employee.id) {
      return response.authError(
        res,
        "You are not authorized to complete this job."
      );
    }

    if (ad.isCompleted) {
      return response.badRequest(
        res,
        "This job has already been marked as completed."
      );
    }

    const employeeName =
      employee.name.charAt(0).toUpperCase() + employee.name.slice(1);

    const [employer, fcmTokens] = await Promise.all([
      Users.findById(ad.postedBy),
      FcmToken.find({ user_id: ad.postedBy }).select("token"),
    ]);

    if (!employer) {
      return response.notFound(res, "Employer not found.");
    }

    const notificationTitle = `Job Completed - ${ad.title}`;
    const notificationDescription = `${employeeName} marked the job as completed. Please review the work and confirm completion.`;

    const notificationData = {
      id: ad._id,
      pagename: "job-details",
      title: notificationTitle,
      body: notificationDescription,
    };

    const notification = new Notification({
      title: notificationTitle,
      content: notificationDescription,
      icon: "check-box",
      data: JSON.stringify(notificationData),
      user_id: employer._id,
    });
    await notification.save();

    const tokenList = fcmTokens.map((tokenDoc) => tokenDoc.token);

    if (tokenList.length > 0) {
      for (const token of tokenList) {
        await sendNotification(
          notificationTitle,
          notificationDescription,
          notificationData,
          token
        );
      }
    } else {
      console.warn(
        "No FCM tokens found for the employer. Notification not sent."
      );
    }

    if (req.file) {
      const file = await uploadToCloudinary(req.file.path, req.file.mimetype);

      ad.work.url = file.secure_url;
      ad.work.public_id = file.public_id;
    }
    await ad.save();

    return response.success(
      res,
      "Job has been marked as completed and the employer has been notified."
    );
  } catch (error) {
    console.error(`Error completing job: ${error.message}`);
    return response.serverError(
      res,
      "An error occurred while completing the job."
    );
  }
};

module.exports = {
  postAd,
  getAllAds,
  GetAdddetails,
  acceptProposal,
  getHiredUser,
  getHiredUsersAndAds,
  updateAdStatus,
  updateFeatureStatus,
  createResponse,
  getAllResponses,
  getPermissions,
  updatePermissions,
  createMilestone,
  completeJobByEmployee,
};
