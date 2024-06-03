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
      userId,
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

const getAllPortfolio = async (req, res) => {
  try {
    const { user_id } = req.query;

    const portfolios = await Portfolio.find({ userId: user_id });

    return response.success(res, "All portfolios retrieved successfully", {
      portfolios,
    });
  } catch (error) {
    console.error(`Error getting all portfolios: ${error}`);
    return response.serverError(res, `Error getting all portfolios: ${error}`);
  }
};


const updatePortfolio = async (req, res) => {
  try {
    const { id } = req.body;

    const portfolio = await Portfolio.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    
    if (!portfolio) {
      return response.notFound(
        res,
        `Portfolio not found`
      );
    }

    return response.success(res, "Portfolio updated successfully", {
      portfolio,
    });
  } catch (error) {
    console.error(`Error getting all portfolios: ${error}`);
    return response.serverError(res, `Error getting all portfolios: ${error}`);
  }
};


module.exports = {
  createPortfolio,
  getAllPortfolio,
  updatePortfolio,
};
