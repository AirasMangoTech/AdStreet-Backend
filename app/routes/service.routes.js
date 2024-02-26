const express = require('express');
const service_router = express.Router();
const service = require('../controllers/service.controller');
const verifyToken = require("../middleware/auth");

service_router.post('/serviceCreate', [verifyToken], service.createServiceType);
service_router.put('/serviceUpdate/:id', [verifyToken], service.updateServiceType);
service_router.get('/serviceGetAll', service.getAllServiceTypes);
service_router.delete('/serviceDelete/:id', [verifyToken], service.deleteServiceType);


module.exports = service_router;
