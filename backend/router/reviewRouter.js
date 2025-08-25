const express = require('express');
const router = express.Router();
const { checkAuth } = require('../middleware/checkAuth');
const { addReview, getReviews, canReview } = require('../controller/reviewController');

router.get('/:productId', getReviews);
router.get('/can-review/:productId', checkAuth, canReview);
router.post('/', checkAuth, addReview);

module.exports = router;
