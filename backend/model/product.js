const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  // basic
  name: { type: String, required: true, trim: true }, // title
  shortDescription: { type: String, default: '' },
  description: { type: String, trim: true },

  // pricing
  regularPrice: { type: Number, required: true, min: 0 },
  salePrice: { type: Number, min: 0 },

  // media
  featuredImage: { type: String },
  images: [{ type: String }],

  // relations
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory' },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },

  // ownership
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // vendor reference (nullable for company product)
  isCompanyProduct: { type: Boolean, default: false },

  // variants (optional)
  colors: [{ type: String }],
  sizes: [{ type: String }],

  // inventory
  inventoryCount: { type: Number, default: 0, min: 0 },
  outOfStock: { type: Boolean, default: false },

  // reviews aggregate
  avgRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Product', productSchema);
