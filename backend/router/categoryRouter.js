const express = require('express');
const router = express.Router();
const { addCategory, getCategories, updateCategory, deleteCategory } = require('../controller/categoryController');
const { checkAdmin } = require('../middleware/checkAuth');

// Only admin can add category
router.post('/', checkAdmin, addCategory);

// Anyone can get categories
router.get('/', getCategories);

// Admin can update & delete
router.put('/:id', checkAdmin, updateCategory);
router.delete('/:id', checkAdmin, deleteCategory);

module.exports = router;
