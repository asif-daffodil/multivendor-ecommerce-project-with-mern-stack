const express = require('express');
const router = express.Router();
const { checkAdmin } = require('../middleware/checkAuth');
const { addBrand, getBrands, updateBrand, deleteBrand } = require('../controller/brandController');

router.get('/', getBrands);
router.post('/', checkAdmin, addBrand);
router.put('/:id', checkAdmin, updateBrand);
router.delete('/:id', checkAdmin, deleteBrand);

module.exports = router;
