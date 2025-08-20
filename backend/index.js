const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Authorization']
}));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static('public'));

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

app.listen(4000, () => {
    console.log('Server is running on port 4000');
})