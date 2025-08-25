const Review = require('../model/review');
const Product = require('../model/product');
const Order = require('../model/order');

exports.addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    if (!productId || !rating) return res.status(400).json({ message: 'productId and rating are required' });

    // ensure user has at least one delivered order containing this product
    const hasDelivered = await Order.findOne({ user: req.user._id, status: 'delivered', 'items.product': productId });
    if (!hasDelivered) return res.status(403).json({ message: 'You can only review products you have purchased and received' });

    // If user already has a review for this product, update it; otherwise create
    let review = await Review.findOne({ product: productId, user: req.user._id });
    if (review) {
      review.rating = rating;
      review.comment = comment || '';
      await review.save();
    } else {
      review = await Review.create({ product: productId, user: req.user._id, rating, comment });
    }

    // recompute aggregates
    const agg = await Review.aggregate([
      { $match: { product: review.product } },
      { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    const { avg = 0, count = 0 } = agg[0] || {};
    await Product.findByIdAndUpdate(review.product, { avgRating: avg, reviewCount: count });
    res.status(review.isNew ? 201 : 200).json(review);
  } catch (e) {
    console.error('[addReview] error', e);
    res.status(500).json({ message: 'Failed to add review' });
  }
};

exports.canReview = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!productId) return res.status(400).json({ canReview: false });
    const hasDelivered = await Order.findOne({ user: req.user._id, status: 'delivered', 'items.product': productId });
    // also indicate whether the user already reviewed
    const existing = await Review.findOne({ product: productId, user: req.user._id });
    res.json({ canReview: !!hasDelivered, alreadyReviewed: !!existing });
  } catch (e) {
    res.status(500).json({ canReview: false });
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
