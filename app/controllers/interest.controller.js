const Interest = require("../models/interest");
const response = require("../utils/responseHelpers");

const toggleInterest = async (req, res) => {
  try {
    const { blogId } = req.params; // The ID of the blog post
    const userId = req.user.id; // The ID of the user from the request, typically populated by middleware

    // Find an existing interest record
    let interest = await Interest.findOne({ blog: blogId, user: userId });

    // If there's no existing record, create one with expressedInterest set to true
    if (!interest) {
      interest = new Interest({
        blog: blogId,
        user: userId,
        expressedInterest: true,
      });
    } else {
      // If there is a record, toggle the expressedInterest value
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

module.exports = {
  toggleInterest,
};
