const express = require('express');
const router = express.Router();
const { initPayment, paymentSuccess, debugPayment, vendorSummary, adminVendorReport, createPayout } = require('../controller/paymentController');
const { checkAuth } = require('../middleware/checkAuth');
const { checkAdmin, checkVendor } = require('../middleware/checkAuth');

console.log('[startup] paymentRouter loaded from', __filename);

// init payment (client will POST amount and order id)
router.post('/ssl/init', checkAuth, initPayment);
router.post('/ssl/debug', checkAuth, debugPayment);

// Vendor: view their payment summary
router.get('/vendor/summary', checkVendor, vendorSummary);

// Admin: vendor-wise report and create payout
router.get('/admin/vendors', checkAdmin, adminVendorReport);
router.post('/admin/payouts', checkAdmin, createPayout);

// diagnostic: tell which process/file served this router
router.get('/which', (req, res) => {
	res.json({ pid: process.pid, file: __filename });
});

// payment success (SSLCommerz will post back)
router.post('/ssl/success', paymentSuccess);

module.exports = router;
