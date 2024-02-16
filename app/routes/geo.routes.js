const express = require("express");
const geo = require("../controllers/geo.controller");

const geo_route = express.Router();


geo_route.get('/countries', geo.countries);
geo_route.get('/states/:id', geo.states);
geo_route.get('/cities/:id', geo.cities);

module.exports = geo_route;
