const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'vendor'],
        default: 'user'
    },
    profilePicture: {
        type: String,
        default: 'profile_pictures/default.jpg'
    },
    banned: {
        type: Boolean,
        default: false
    },
    banReason: { type: String },
    bannedAt: { type: Date },
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
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

const User = mongoose.model('User', userSchema);

module.exports = User;