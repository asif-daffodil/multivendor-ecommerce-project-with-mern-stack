const express = require('express');
const router = express.Router();
const { checkAdmin } = require('../middleware/checkAuth');
const ctrl = require('../controller/adminController');

router.get('/stats', checkAdmin, ctrl.getStats);

module.exports = router;
