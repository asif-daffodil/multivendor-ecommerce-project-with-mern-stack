const axios = require('axios');
const SSLCommerzPayment = require('sslcommerz-lts');
const Order = require('../model/order');
const Category = require('../model/category');
const VendorPayout = require('../model/vendorPayout');
const User = require('../model/user');

// Use env variables, fall back to empty strings if not set
const STORE_ID = process.env.SSLCZ_STORE_ID || '';
const STORE_PASSWORD = process.env.SSLCZ_PASSWORD || '';
// Normalize sandbox flag (expecting 'true' when using sandbox). Default to true for safety.
const IS_SANDBOX = (process.env.SSLCZ_SANDBOX || 'true').toString().toLowerCase() === 'true';
const isLive = !IS_SANDBOX; // SDK usually expects a boolean indicating live mode

const getApiBase = () => IS_SANDBOX ? 'https://sandbox.sslcommerz.com' : 'https://securepay.sslcommerz.com';

const 
initPayment = async (req, res) => {
  try {
    // Ensure credentials are present before calling SDK
    if (!STORE_ID || !STORE_PASSWORD) {
      console.error('[sslcommerz] missing credentials', { STORE_ID: !!STORE_ID, STORE_PASSWORD: !!STORE_PASSWORD });
      return res.status(500).json({
        message: 'SSLCommerz credentials missing on server. Please set SSLCZ_STORE_ID and SSLCZ_PASSWORD in your .env',
        note: 'For sandbox/testing set SSLCZ_SANDBOX=true and valid sandbox credentials.'
      });
    }
    const { amount, order_id, currency = 'BDT', success_url, fail_url, cancel_url, billing_name, billing_address } = req.body;
    if (!amount || !order_id) return res.status(400).json({ message: 'amount and order_id required' });

    // Prefer authenticated user's email/phone when available (route should be protected)
    const cus_email = (req.user && req.user.email) || req.body.cus_email || req.body?.billingAddress?.email || '';
    const cus_phone = (req.user && req.user.phone) || req.body.cus_phone || '';
    if (!cus_email) return res.status(400).json({ message: 'cus_email is required' });

  // prefer an explicit BACKEND_URL env var; otherwise derive from request
  const backendBase = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;

  // Shipping info: SSLCommerz expects shipping_method (YES/NO or courier name). Default to 'NO' when not provided.
  const shipping_method = req.body.shipping_method || 'NO';
  const ship_name = req.body.ship_name || req.body.shipping_name || '';
  const ship_add1 = req.body.ship_add1 || req.body.shipping_address || '';
  const ship_city = req.body.ship_city || req.body.shipping_city || '';
  const ship_state = req.body.ship_state || req.body.shipping_state || '';
  const ship_postcode = req.body.ship_postcode || req.body.shipping_postcode || '';
  const ship_country = req.body.ship_country || req.body.shipping_country || '';

    const data = {
      total_amount: amount,
      currency,
      tran_id: order_id,
      success_url: success_url || `${backendBase}/payments/ssl/success`,
      fail_url: fail_url || `${backendBase}/payments/ssl/fail`,
      cancel_url: cancel_url || `${backendBase}/payments/ssl/cancel`,
      ipn_url: `${backendBase}/payments/ssl/ipn`,
      product_name: req.body.product_name || 'Order',
      product_category: req.body.product_category || 'General',
      product_profile: req.body.product_profile || 'general',
      cus_name: billing_name || (req.user && (req.user.name || req.user.fullName)) || 'Guest',
      cus_email,
      cus_add1: billing_address || '',
      cus_city: req.body.cus_city || '',
      cus_state: req.body.cus_state || '',
      cus_postcode: req.body.cus_postcode || '',
      cus_country: req.body.cus_country || 'Bangladesh',
      cus_phone
  ,
  // shipping fields
  shipping_method,
  ship_name,
  ship_add1,
  ship_city,
  ship_state,
  ship_postcode,
  ship_country
    };

  // Log the payload we'll send (mask sensitive fields)
  console.log('[sslcommerz] init payload', { ...data, store_passwd: STORE_PASSWORD ? '***' : '' });

  const sslcz = new SSLCommerzPayment(STORE_ID, STORE_PASSWORD, isLive);
  const apiResponse = await sslcz.init(data);
    console.log('[sslcommerz] sdk response', apiResponse);
    const GatewayPageURL = apiResponse?.GatewayPageURL || apiResponse?.gateway_page_url;
    if (!GatewayPageURL) {
      return res.status(502).json({ message: 'No GatewayPageURL returned', details: apiResponse });
    }
    return res.json({ data: apiResponse });
  } catch (err) {
    console.error('[sslcommerz] init error', err?.response?.data || err.message || err);
    if (err.response && err.response.data) return res.status(502).json({ message: 'Payment gateway error', details: err.response.data });
    return res.status(500).json({ message: 'Error initiating payment', error: err.message || err });
  }
};

// Safe debug endpoint: build the same payload but do NOT call SSLCommerz.
// Returns the masked payload and apiUrl so you can verify what will be sent.
const debugPayment = async (req, res) => {
  try {
    const { amount, order_id, currency = 'BDT', success_url, fail_url, cancel_url, billing_name, billing_address } = req.body;
    if (!amount || !order_id) return res.status(400).json({ message: 'amount and order_id required' });

    const cus_email = (req.user && req.user.email) || req.body.cus_email || req.body?.billingAddress?.email || '';
    const cus_phone = (req.user && req.user.phone) || req.body.cus_phone || '';
    const finalEmail = cus_email;
    if (!finalEmail) {
      return res.status(400).json({ message: 'cus_email missing in debug payload' });
    }

    const backendBase = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;

    const paramsObj = {
      store_id: STORE_ID || '',
      store_passwd: STORE_PASSWORD ? '***' : '',
      total_amount: amount,
      currency,
      tran_id: order_id,
      success_url: success_url || `${backendBase}/payments/ssl/success`,
      fail_url: fail_url || `${backendBase}/payments/ssl/fail`,
      cancel_url: cancel_url || `${backendBase}/payments/ssl/cancel`,
      cus_name: billing_name || (req.user && (req.user.name || req.user.fullName)) || 'Guest',
      cus_email: finalEmail,
      cus_add1: billing_address || '',
      cus_city: req.body.cus_city || '',
      cus_state: req.body.cus_state || '',
      cus_postcode: req.body.cus_postcode || '',
      cus_country: req.body.cus_country || 'Bangladesh',
      cus_phone: cus_phone,
      // shipping
      shipping_method,
      ship_name,
      ship_add1,
      ship_city,
      ship_state,
      ship_postcode,
      ship_country,
      product_name: req.body.product_name || 'Order',
      product_category: req.body.product_category || 'General',
      product_profile: req.body.product_profile || 'general'
    };

  const apiUrl = `${getApiBase()}/gwprocess/v4/api.php`;
  return res.json({ apiUrl, payload: paramsObj, credentialsPresent: !!STORE_ID && !!STORE_PASSWORD });
  } catch (err) {
    return res.status(500).json({ message: 'debug error', error: err.message || err });
  }
};

const paymentSuccess = async (req, res) => {
  // SSLCommerz will POST back data to merchant's success URL (IPN is separate). Here we accept posted data and update order if needed.
  try {
    const body = req.body || {};
    // tran_id should be our order id
    const tran_id = body.tran_id || body.tran_id;
    if (tran_id) {
      // Persist payment summary into order.payment and update status
      // prefer val_id (gateway validation id) > sessionkey > tran_id (merchant tran id)
      const gatewayId = body.val_id || body.sessionkey || body.tran_id || '';
      const paymentSummary = {
        method: 'sslcommerz',
        provider: 'sslcommerz',
        gatewayTransactionId: gatewayId,
        // keep the original merchant tran id too
        merchantTranId: body.tran_id || '',
        sessionKey: body.sessionkey || '',
        cardIssuer: body.card_issuer || body.card_issuer_bank || '',
        cardType: body.card_type || '',
        status: body.status || body.status_message || 'success',
        amount: parseFloat(body.amount || body.store_amount || 0),
        currency: body.currency || body.currency_type || '',
        raw: body
      };
      await Order.findOneAndUpdate({ _id: tran_id }, { $set: { paymentMethod: 'sslcommerz', payment: paymentSummary, status: 'accepted' } });
    }
    // If the gateway POST came from a browser redirect, redirect the user to the frontend success page
    const frontendBase = process.env.APP_URL || process.env.FRONTEND_URL || 'http://localhost:5173';
    const qs = new URLSearchParams();
    if (body.val_id) qs.set('val_id', body.val_id);
    if (body.tran_id) qs.set('tran_id', body.tran_id);
    if (body.amount || body.store_amount) qs.set('amount', body.amount || body.store_amount);
    if (body.status) qs.set('status', body.status);

    // If caller accepts JSON (API call), return JSON; otherwise redirect browser to frontend success page
    const acceptsJson = req.headers['accept'] && req.headers['accept'].includes('application/json');
    if (acceptsJson) {
      return res.json({ message: 'Payment success received', body });
    }

  // Redirect to the frontend root with query params so the SPA index loads and can handle client-side navigation.
  const redirectUrl = `${frontendBase.replace(/\/$/, '')}/?${qs.toString()}`;
  return res.redirect(302, redirectUrl);
  } catch (error) {
    res.status(500).json({ message: 'Error processing success', error });
  }
};

module.exports = { initPayment, paymentSuccess, debugPayment };

// Vendor summary: total sold, service charges, net payable, amount paid (from payouts), amount due
const vendorSummary = async (req, res) => {
  try {
  const vendorId = req.user._id;
  // Count only delivered orders for vendor totals
  const orders = await Order.find({ 'items.vendor': vendorId, status: 'delivered' }).populate('items.product');

    let gross = 0;
    let charges = 0;

    for (const o of orders) {
      for (const it of o.items) {
        if (!it.vendor) continue;
        if (it.vendor.toString() !== vendorId.toString()) continue;
        const lineTotal = Number(it.price || 0) * Number(it.qty || 1);
        gross += lineTotal;
        // determine category service charge
        let pct = 10; // default
        if (it.product && it.product.category) {
          const cat = await Category.findById(it.product.category);
          if (cat && typeof cat.serviceCharge === 'number') pct = cat.serviceCharge;
        }
        charges += (lineTotal * (pct / 100));
      }
    }

  const payouts = await VendorPayout.find({ vendor: vendorId });
  // Sum actual amounts paid; fall back to netPayable for older records where amountPaid may be absent
  const paidAmount = payouts.reduce((s, p) => s + (typeof p.amountPaid === 'number' && !Number.isNaN(p.amountPaid) ? p.amountPaid : (p.paid ? (p.netPayable || 0) : 0)), 0);
    const net = gross - charges;
    const due = Math.max(0, net - paidAmount);

    res.json({ vendor: vendorId, grossSales: gross, serviceCharges: charges, netPayable: net, paidAmount, due });
  } catch (err) {
    res.status(500).json({ message: 'Error computing vendor summary', error: err.message || err });
  }
};

// Admin: get summarized data vendor-wise (with optional vendorId filter)
const adminVendorReport = async (req, res) => {
  try {
    const { vendorId } = req.query;
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.max(1, parseInt(req.query.limit || '10', 10));
    const match = { 'items.vendor': { $exists: true } };
    if (vendorId) match['items.vendor'] = vendorId;

    // Aggregate by vendor with pagination using $facet
    const q = (req.query.q || '').trim();
    const sortKey = req.query.sortKey || 'grossSales';
    const sortDir = req.query.sortDir === 'asc' ? 1 : -1;

    // Build aggregation pipeline: group by vendor, lookup vendor data, optional search, sort, then facet for pagination
    // Only consider delivered orders for admin vendor report totals
    const pipeline = [
      { $match: { status: 'delivered' } },
      { $unwind: '$items' },
      { $match: { 'items.vendor': { $ne: null } } },
      { $group: {
        _id: '$items.vendor',
        grossSales: { $sum: { $multiply: ['$items.price', { $ifNull: ['$items.qty', 1] }] } },
        orderCount: { $sum: 1 }
      } },
      // join user data
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'vendor' } },
      { $unwind: { path: '$vendor', preserveNullAndEmptyArrays: true } },
    ];

    // apply search on vendor name/email if provided
    if (q) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      pipeline.push({ $match: { $or: [ { 'vendor.name': regex }, { 'vendor.email': regex } ] } });
    }

    // determine sort stage
    let sortStage;
    if (sortKey === 'vendor') sortStage = { 'vendor.name': sortDir };
    else if (sortKey === 'orderCount') sortStage = { orderCount: sortDir };
    else sortStage = { grossSales: sortDir };

    // Special case: sorting by 'due' requires computing due for each vendor first,
    // so aggregate all vendors, compute due, then sort/paginate in JS.
    if (sortKey === 'due') {
      const pipelineAll = [
        { $match: { status: 'delivered' } },
        { $unwind: '$items' },
        { $match: { 'items.vendor': { $ne: null } } },
        { $group: {
          _id: '$items.vendor',
          grossSales: { $sum: { $multiply: ['$items.price', { $ifNull: ['$items.qty', 1] }] } },
          orderCount: { $sum: 1 }
        } },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'vendor' } },
        { $unwind: { path: '$vendor', preserveNullAndEmptyArrays: true } },
      ];

      if (q) {
        const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        pipelineAll.push({ $match: { $or: [ { 'vendor.name': regex }, { 'vendor.email': regex } ] } });
      }

      const allRows = await Order.aggregate(pipelineAll);
      const allResults = [];
      for (const row of allRows) {
        const vendor = await User.findById(row._id).select('name email');
        const orders = await Order.find({ 'items.vendor': row._id }).populate('items.product');
        let charges = 0;
        for (const o of orders) for (const it of o.items) {
          if (!it.vendor) continue;
          if (it.vendor.toString() !== row._id.toString()) continue;
          const lineTotal = Number(it.price || 0) * Number(it.qty || 1);
          let pct = 10;
          if (it.product && it.product.category) {
            const cat = await Category.findById(it.product.category);
            if (cat && typeof cat.serviceCharge === 'number') pct = cat.serviceCharge;
          }
          charges += (lineTotal * (pct / 100));
        }
        const net = (row.grossSales || 0) - charges;
  const payouts = await VendorPayout.find({ vendor: row._id });
  const paidAmount = payouts.reduce((s,p)=>s + (typeof p.amountPaid === 'number' && !Number.isNaN(p.amountPaid) ? p.amountPaid : (p.paid ? (p.netPayable||0) : 0)), 0);
        const due = Math.max(0, net - paidAmount);
        allResults.push({ vendor: vendor || { _id: row._id }, grossSales: row.grossSales, serviceCharges: charges, netPayable: net, paidAmount, due, orderCount: row.orderCount });
      }

      // sort by due
      allResults.sort((a,b) => {
        const va = Number(a.due || 0);
        const vb = Number(b.due || 0);
        return sortDir === 1 ? va - vb : vb - va;
      });

      const total = allResults.length;
      const totalPages = Math.max(1, Math.ceil(total / limit));
      const paged = allResults.slice((page - 1) * limit, (page - 1) * limit + limit);
      return res.json({ results: paged, page, pageSize: limit, total, totalPages });
    }

    pipeline.push({ $sort: sortStage });

    pipeline.push({ $facet: {
      metadata: [ { $count: 'total' } ],
      data: [ { $skip: (page - 1) * limit }, { $limit: limit } ]
    } });

    const aggRes = await Order.aggregate(pipeline);
    const meta = (aggRes && aggRes[0] && aggRes[0].metadata && aggRes[0].metadata[0]) ? aggRes[0].metadata[0] : { total: 0 };
    const total = meta.total || 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const rows = (aggRes && aggRes[0] && aggRes[0].data) ? aggRes[0].data : [];

    const results = [];
    for (const row of rows) {
      const vendor = await User.findById(row._id).select('name email');
      // compute service charge for vendor by scanning their sold items (simpler but accurate)
      const orders = await Order.find({ 'items.vendor': row._id }).populate('items.product');
      let charges = 0;
      for (const o of orders) for (const it of o.items) {
        if (!it.vendor) continue;
        if (it.vendor.toString() !== row._id.toString()) continue;
        const lineTotal = Number(it.price || 0) * Number(it.qty || 1);
        let pct = 10;
        if (it.product && it.product.category) {
          const cat = await Category.findById(it.product.category);
          if (cat && typeof cat.serviceCharge === 'number') pct = cat.serviceCharge;
        }
        charges += (lineTotal * (pct / 100));
      }
      const net = (row.grossSales || 0) - charges;
  const payouts = await VendorPayout.find({ vendor: row._id });
  const paidAmount = payouts.reduce((s,p)=>s + (typeof p.amountPaid === 'number' && !Number.isNaN(p.amountPaid) ? p.amountPaid : (p.paid ? (p.netPayable||0) : 0)), 0);
      const due = Math.max(0, net - paidAmount);

      results.push({ vendor: vendor || { _id: row._id }, grossSales: row.grossSales, serviceCharges: charges, netPayable: net, paidAmount, due, orderCount: row.orderCount });
    }

    res.json({ results, page, pageSize: limit, total, totalPages });
  } catch (err) {
    res.status(500).json({ message: 'Error generating admin vendor report', error: err.message || err });
  }
};

// Admin: create a payout record for a vendor (will mark paid if paid=true)
const createPayout = async (req, res) => {
  try {
  const { vendorId, periodStart, periodEnd, netPayable, amountPaid, paid } = req.body;
  console.log('[createPayout] user:', req.user?._id, 'body:', req.body);
  if (!vendorId) return res.status(400).json({ message: 'vendorId required' });
  // validate ObjectId
  const mongoose = require('mongoose');
  if (!mongoose.Types.ObjectId.isValid(vendorId)) return res.status(400).json({ message: 'vendorId is not a valid id' });

  // ensure vendor user exists
  const vendorUser = await User.findById(vendorId).select('name email role');
  if (!vendorUser) return res.status(404).json({ message: 'Vendor user not found for given vendorId' });

  if (typeof netPayable === 'undefined' || netPayable === '' || Number.isNaN(Number(netPayable))) return res.status(400).json({ message: 'netPayable must be a valid number' });
  const numericNet = Number(netPayable);
  let numericPaid = 0;
  if (typeof amountPaid !== 'undefined' && amountPaid !== '') {
    if (Number.isNaN(Number(amountPaid))) return res.status(400).json({ message: 'amountPaid must be a valid number' });
    numericPaid = Number(amountPaid);
  } else if (paid) {
    // if paid flag is true but amountPaid not provided, assume full netPayable
    numericPaid = numericNet;
  }

  // consider payout paid if amountPaid >= netPayable or paid flag true
  const isPaid = !!paid || (numericPaid >= numericNet && numericNet > 0);

  const payout = new VendorPayout({ vendor: vendorId, periodStart: periodStart ? new Date(periodStart) : undefined, periodEnd: periodEnd ? new Date(periodEnd) : undefined, grossSales: 0, serviceCharges: 0, netPayable: numericNet, amountPaid: numericPaid, paid: isPaid, paidAt: isPaid ? new Date() : undefined });
  await payout.save();
  console.log('[createPayout] saved payout', payout._id);
  res.status(201).json({ message: 'Payout created', payout });
  } catch (err) {
    res.status(500).json({ message: 'Error creating payout', error: err.message || err });
  }
};

module.exports = { initPayment, paymentSuccess, debugPayment, vendorSummary, adminVendorReport, createPayout };
