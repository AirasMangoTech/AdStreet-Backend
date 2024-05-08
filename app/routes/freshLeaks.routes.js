const freshLeaks = require('../controllers/freshLeaks.controller');
const express = require('express');
const fresh_router = express.Router();
const verifyToken = require("../middleware/auth");

fresh_router.post('/createfreshLeaks', freshLeaks.createFreshLeaks);
fresh_router.get('/getAllfreshLeaks', freshLeaks.getAllFreshLeaks);
fresh_router.put("/updateStatus/:id",  freshLeaks.updateFreshLeaks );
fresh_router.delete("/delete/:id", freshLeaks.deleteFreshLeaks );

module.exports = fresh_router;