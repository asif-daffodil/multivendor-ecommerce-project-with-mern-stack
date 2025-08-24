const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
// Load .env explicitly from this backend folder to avoid cwd issues
require('dotenv').config({ path: __dirname + '/.env' });
console.log('[startup] backend PID', process.pid);
console.log('[startup] SSL env present', { SSLCZ_STORE_ID: !!process.env.SSLCZ_STORE_ID, SSLCZ_PASSWORD: !!process.env.SSLCZ_PASSWORD, SSLCZ_SANDBOX: process.env.SSLCZ_SANDBOX });
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Authorization']
}));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static('public'));

// Debug: log incoming payments-related requests
app.use('/payments', (req, res, next) => {
    console.log('[incoming] payments request', { pid: process.pid, method: req.method, path: req.path, headers: { authorization: !!req.headers.authorization } });
    next();
});

const conn = mongoose.connect(process.env.MONGODB_URI);
if(conn) {
    console.log("DB Connected successfully");
}

const apiRouter = require('./router/api');
app.use('/api', apiRouter);

const userRouter = require('./router/userRouter');
app.use('/user', userRouter);

const authRouter = require('./router/authRouter');
app.use('/auth', authRouter);

const categoryRouter = require('./router/categoryRouter');
app.use('/category', categoryRouter);

const productRouter = require('./router/productRouter');
app.use('/products', productRouter);

const subCategoryRouter = require('./router/subCategoryRouter');
app.use('/subcategory', subCategoryRouter);

const brandRouter = require('./router/brandRouter');
app.use('/brand', brandRouter);

const reviewRouter = require('./router/reviewRouter');
app.use('/reviews', reviewRouter);

const orderRouter = require('./router/orderRouter');
app.use('/orders', orderRouter);

const paymentRouter = require('./router/paymentRouter');
app.use('/payments', paymentRouter);

const adminRouter = require('./router/adminRouter');
app.use('/admin', adminRouter);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
})