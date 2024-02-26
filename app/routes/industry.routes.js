const express = require('express');
const industry_router = express.Router();
const industry = require('../controllers/industry.controller');
const verifyToken = require("../middleware/auth");

industry_router.post('/industryCreate', [verifyToken], industry.createIndustry);
industry_router.put('/industryUpdate/:id', [verifyToken], industry.updateIndustry);
industry_router.get('/industryGetAll', industry.getAllIndustry);
industry_router.delete('/industryDelete,/:id', [verifyToken], industry.deleteIndustry
);


module.exports = industry_router;
