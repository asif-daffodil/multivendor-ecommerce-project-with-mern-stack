const express = require('express');
const router = express.Router();
const { addSubCategory, getSubCategories, updateSubCategory, deleteSubCategory } = require('../controller/subCategoryController');
const { checkAdmin } = require('../middleware/checkAuth');

router.get('/', getSubCategories);
router.post('/', checkAdmin, addSubCategory);
router.put('/:id', checkAdmin, updateSubCategory);
router.delete('/:id', checkAdmin, deleteSubCategory);

module.exports = router;
