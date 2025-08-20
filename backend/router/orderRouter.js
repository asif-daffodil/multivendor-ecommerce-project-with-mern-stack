const express = require('express');
const router = express.Router();
const { checkAuth, checkAdmin, checkVendor } = require('../middleware/checkAuth');
const ctrl = require('../controller/orderController');

// Create order (authenticated user)
router.post('/', checkAuth, ctrl.createOrder);

// Get current user's orders
router.get('/', checkAuth, ctrl.getOrdersForUser);

// Admin: get all orders
router.get('/admin', checkAdmin, ctrl.getAllOrders);

// Vendor: get orders that include vendor's items
router.get('/vendor', checkVendor, ctrl.getOrdersForVendor);

// Update status (admin or vendor for their orders)
router.patch('/:id/status', checkAuth, ctrl.updateOrderStatus);

// Admin delete
router.delete('/:id', checkAdmin, ctrl.deleteOrder);

module.exports = router;
