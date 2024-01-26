const Ad = require("../models/ad");
const response = require("../utils/responseHelpers");

const postAd = async (req, res) => {
  if (!req.user) {
    return response.forbidden(res, "User not authenticated", user);
  }
  try {
    const { title, category, description, budget, jobDuration } = req.body;
    //const image = req.file.path; // Assuming file paths are sent from the frontend and you're using a middleware like multer for file handling
    
    const newAd = new Ad({
      title,
      category,
     // image,
      description,
      budget,
      jobDuration,
      postedBy: req.user.id, 
    });

    await newAd.save();

    return response.success(res, "Ad posted successfully", newAd);
  } catch (error) {
    console.error(`Error posting ad: ${error}`);
    return response.serverError(res, "Error posting ad");
  }
 
};
console.log()
module.exports = {
  postAd,
};
