const Portfolio = require('../models/portfolio');
const response = require('../utils/responseHelpers');
const createPortfolio = async (req, res) => {
  try {
    const { userId, projectUrl, title, imageUrl, completionDate, description } = req.body;

    // Validate the input
    if (!userId || !title) {
        return response.badRequest(res, 'User ID and title are required.', 400);
    }

    const newPortfolio = new Portfolio({
      userId: req.user._id,
      projectUrl,
      image: req.body.imageUrl,
      title,
      completionDate,
      description
    });

    await newPortfolio.save();
    return response.success(res, 'Portfolio created successfully', {newPortfolio});
  } catch (error) {
        console.error(`Error creating portfolio: ${error}`);    
        return response.serverError(res, `Error creating portfolio: ${error}`);
  }
};

module.exports = {
  createPortfolio
};
