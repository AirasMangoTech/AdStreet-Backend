const express = require('express');
const portfolio_router = express.Router();
const verifyToken = require("../middleware/auth");
const portfolioController = require('../controllers/portfolio.controller');

portfolio_router.post('/create-portfolio',[verifyToken], portfolioController.createPortfolio);

module.exports = portfolio_router;
