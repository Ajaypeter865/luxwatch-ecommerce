const mongoose = require('mongoose')


const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        minLength : 3
    },

    discountType: {
        type: String,
        enum: ['Percentage', 'Fixed'],
        default : 'Percentage'
    },

    discountValue: {
        type: Number,
        default: 10,
    },

    expiryDate: {
        type: Date,
        required: true,
    },

    minPurchase: {
        type: Number,
        min: 100,
    },

    active: {
        type: Boolean,
        default: true,
    },

    usedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    }]

}, { timestamps: true })

const couponModel = mongoose.model('Coupon', couponSchema)

module.exports = couponModel