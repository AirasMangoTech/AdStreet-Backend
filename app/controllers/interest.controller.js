const Interest = require("../models/interest");
const response = require("../utils/responseHelpers");

const toggleInterest = async (req, res) => {
  try {
    const { blogId } = req.params; 
    const userId = req.user.id;

    const interestRecord = await Interest.findOne({ 
      blog: blogId, 
      user: userId, 
      expressedInterest: true 
    });
    console.log(interestRecord);


    return response.success(res, "All blogs retrieved successfully", {
      interestRecord
    });

    // var deleteall = await Interest.deleteMany({});
    // return response.success(res, "Delete all interest successfully", {});

    let interest = await Interest.findOne({ blog: blogId, user: userId });

    if (!interest) {
      interest = new Interest({
        blog: blogId,
        user: userId,
        expressedInterest: true,
      });
    } else {
      interest.expressedInterest = !interest.expressedInterest;
      interest.updatedAt = Date.now(); // Update the timestamp
    }

    await interest.save();
    
    const message = interest.expressedInterest
      ? "You have expressed interest in this blog."
      : "You have retracted interest in this blog.";

    return response.success(res, message, {
      interest: interest.expressedInterest,
    });
  } catch (error) {
    console.error(error);
    return response.serverError(
      res,
      "Failed to toggle interest",
      error.message
    );
  }
};

const gettoggleInterest = async (req, res) => {
  try {

    const { blogId } = req.params; 

    let interest = await Interest.find({ blog: blogId });
    return response.success(res, message, {
      interest
    });
  } catch (error) {
    console.log(error);
    return response.serverError(
      res,
      error.message,
      "Failed to load Payment Method"
    );
  }
};

module.exports = {
  toggleInterest,
  gettoggleInterest,
};
