const express = require('express');
const router = express.Router();
const { checkAuth } = require('../middleware/checkAuth');
const { addReview, getReviews } = require('../controller/reviewController');

router.get('/:productId', getReviews);
router.post('/', checkAuth, addReview);

module.exports = router;
