const express = require('express');
const router = express.Router();
const cc = require('../controllers/category.controller');
//const {verifyAdmin} = require('../middleware/verifyadmin')

router.post('/categories',cc.createCategory);
router.get('/allcategories', cc.getAllCategories);
router.get('/categoriesId/:id', cc.getCategoryById);
router.put('/update/:id', cc.updateCategory);
router.delete('/delete/:id', cc.deleteCategory);

module.exports = router;
