const express = require('express');
const router = express.Router();
const { createProduct, getProducts, getMyProducts, updateProduct, deleteProduct, getProductById } = require('../controller/productController');
const { checkAuth } = require('../middleware/checkAuth');
const upload = require('../middleware/uploadImage');

// Vendor or Admin (authenticated) with uploads
router.post('/', (req, _res, next) => { req.folderName = 'uploads/products'; next(); }, checkAuth, upload.fields([
	{ name: 'featuredImage', maxCount: 1 },
	{ name: 'images', maxCount: 10 },
]), createProduct);

// Public list
router.get('/', getProducts);

// Authenticated: my products (vendor) - place BEFORE '/:id' to avoid route conflicts
router.get('/mine', checkAuth, getMyProducts);

// Public: single product by id
router.get('/:id', getProductById);

// Update/Delete (owner or admin)
router.put('/:id', (req, _res, next) => { req.folderName = 'uploads/products'; next(); }, checkAuth, upload.fields([
	{ name: 'featuredImage', maxCount: 1 },
	{ name: 'images', maxCount: 10 },
]), updateProduct);
router.delete('/:id', checkAuth, deleteProduct);

module.exports = router;
