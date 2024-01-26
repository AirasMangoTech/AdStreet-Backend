const express = require("express");
const ctrl = require("../controllers/users.controller");
const verifyToken = require("../middleware/auth");
const route = express.Router();
const { handleImageUpload } = require('../controllers/app.controller');
const {upload} = require('../utils/imageUpload');
// route.get('/services', ctrl.getServices);
// route.get('/queries', [verifyToken] ,ctrl.getQueries);
// route.post('/submit', ctrl.submitQuery);

// route.get('/v2/queries', [verifyToken] ,ctrl.getNewQueries);
// route.get('/v2/queries/details', [] ,ctrl.queryDetails);
// route.post('/v2/submit', ctrl.submitNewQuery);

route.post('/uploadImage',[verifyToken, upload.single('image')], handleImageUpload);


module.exports = route;
