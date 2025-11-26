const mongooose = require('mongoose')


const couponSchema = new mongooose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
    },

    discountType : {
        type : String,
        enum : ['Percentage', 'Fixed']
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

    isActive: {
        type: Boolean,
        default: true,
    },

    usedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }]

}, { timestamps: true })

const couponModel = mongooose.model('Coupon', couponSchema)

module.exports = couponModel