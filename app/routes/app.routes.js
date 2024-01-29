const express = require("express");
const ctrl = require("../controllers/users.controller");
const verifyToken = require("../middleware/auth");
const route = express.Router();
const { handleImageUpload } = require('../controllers/app.controller');
const {upload} = require('../utils/imageUpload');
const {postProposal} = require('../controllers/proposal.controller');




module.exports = route;
