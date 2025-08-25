// Debug helper: find an admin user, sign a JWT and POST to createPayout
require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const User = require('../model/user');

const MONGO = process.env.MONGO_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/multivendor';
(async ()=>{
  try {
    await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to mongo for test');
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) { console.error('No admin user found in DB'); process.exit(1); }
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    console.log('Using admin:', admin.email, 'id:', admin._id);

    const payload = { vendorId: admin._id, netPayable: 10.5, paid: false };
    const res = await axios.post('http://localhost:4000/payments/admin/payouts', payload, { headers: { Authorization: `Bearer ${token}` } });
    console.log('STATUS', res.status);
    console.log('DATA', res.data);
    process.exit(0);
  } catch (err) {
    if (err.response) {
      console.error('HTTP ERR', err.response.status, err.response.data);
    } else {
      console.error('ERR', err.message || err);
    }
    process.exit(1);
  }
})();
