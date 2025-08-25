const mongoose = require('mongoose');

const vendorPayoutSchema = new mongoose.Schema({
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  periodStart: { type: Date },
  periodEnd: { type: Date },
  grossSales: { type: Number, default: 0 },
  serviceCharges: { type: Number, default: 0 },
  netPayable: { type: Number, default: 0 },
  // amount actually paid in this payout record (supports partial payments)
  amountPaid: { type: Number, default: 0 },
  paid: { type: Boolean, default: false },
  paidAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VendorPayout', vendorPayoutSchema);
