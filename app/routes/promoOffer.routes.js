const promoOffer = require('../controllers/promoOffers.controller');
const express = require('express');
const promo_router = express.Router();
const verifyToken = require("../middleware/auth");

promo_router.post('/createPromo', promoOffer.createPromo);
promo_router.get('/getAllPromos', promoOffer.getAllPromos);
promo_router.put("/updateStatus/:id", promoOffer.updatePromo);
promo_router.delete("/delete/:id",  promoOffer.deletePromo);

module.exports = promo_router;