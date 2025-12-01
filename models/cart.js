const mongoose = require('mongoose')


const appliedCouponSchema = new mongoose.Schema({
    coupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon'
    },
    code: String,
    discountType: {
        type: String,
        enum: ['Percentage', 'Fixed']
    },
    discountValue: Number, // e.g. 10 or 200
    discountAmount: Number // computed rupee discount applied to cart
}, { _id: false });



const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        require: true,
    },

    //  THIS PRODUCTS ARRAY IS THE REFFERANCE OF THE PRODUCTS ADDING BUT THE CUSTOMER - SO EACH OBJECT REPRESENT PRODUCT DETAILS BASED ON THEIR ORDER
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'product',
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                default: 1,
                min: 1
            },
            price: {
                required: true,
                type: Number,
            },
            totalPrice: {
                type: Number,
                required: true,
            },

        }
    ],

    subTotal: {
        type: Number,
        required: true,
    },

    shipping: {
        type: Number,
        default: 0,
    },

    grandTotal: {
        type: Number,
        required: true,
    },

    appliedCoupon: {
        type: appliedCouponSchema,
        default: null
    }
},
    { timestamps: true }
)

const cartModel = mongoose.model('cart', cartSchema)

module.exports = cartModel