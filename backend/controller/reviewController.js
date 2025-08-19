const Review = require('../model/review');
const Product = require('../model/product');

exports.addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    if (!productId || !rating) return res.status(400).json({ message: 'productId and rating are required' });
    const review = await Review.create({ product: productId, user: req.user?._id, rating, comment });
    // recompute aggregates
    const agg = await Review.aggregate([
      { $match: { product: review.product } },
      { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    const { avg = 0, count = 0 } = agg[0] || {};
    await Product.findByIdAndUpdate(review.product, { avgRating: avg, reviewCount: count });
    res.status(201).json(review);
  } catch (e) {
    res.status(500).json({ message: 'Failed to add review' });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId }).populate('user', 'name');
    res.json(reviews);
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
};
