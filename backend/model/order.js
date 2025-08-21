const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: { type: String },
  qty: { type: Number, required: true, default: 1 },
  price: { type: Number, required: true, min: 0 },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  total: { type: Number, required: true, min: 0 },
  paymentMethod: { type: String, default: 'cod' },
  deliveryAddress: {
    fullName: { type: String },
    addressLine: { type: String },
    city: { type: String },
    postalCode: { type: String },
    phone: { type: String },
  },
  billingAddress: {
    fullName: { type: String },
    addressLine: { type: String },
    city: { type: String },
    postalCode: { type: String },
    phone: { type: String },
  },
  shippingAddress: {
    fullName: { type: String },
    addressLine: { type: String },
    city: { type: String },
    postalCode: { type: String },
    phone: { type: String },
  },
  // Payment details captured from gateway callbacks
  payment: {
    method: { type: String }, // e.g. 'cod' or 'sslcommerz'
    provider: { type: String },
    gatewayTransactionId: { type: String },
    status: { type: String },
    amount: { type: Number },
    raw: { type: mongoose.Schema.Types.Mixed }
  },
  status: { type: String, enum: ['pending', 'accepted', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);
