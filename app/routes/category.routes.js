const express = require('express');
const category_router = express.Router();
const cc = require('../controllers/category.controller');
const verifyToken = require("../middleware/auth");


category_router.post('/categories', [verifyToken], cc.createCategory);
category_router.get('/allcategories', cc.getAllCategories);
category_router.get('/categoriesId/:id', cc.getCategoryById);
category_router.put('/update/:id', cc.updateCategory);
category_router.delete('/delete/:id', cc.deleteCategory);

module.exports = category_router;
