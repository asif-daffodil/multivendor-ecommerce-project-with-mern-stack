const axios = require('axios');
const SSLCommerzPayment = require('sslcommerz-lts');
const Order = require('../model/order');

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
