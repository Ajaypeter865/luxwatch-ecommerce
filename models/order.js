const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
        required: true,
    },

    orderItems: [
        {
            productId: {
                type: mongoose.Schema.ObjectId,
                ref: 'product',
                required: true,
            },

            name: {
                type: String,
                required: true,
            },


            quantity: {
                type: Number,
                required: true,
            },
            price: {
                type: Number,
                required: true,

            },
            total: {
                type: Number,
                required: true
            }
        }
    ],

    shippingAddress: {
        fullName: String,
        phone: Number,
        addressLine: String,
        city: String,
        state: String,
        pincode: String,
        alternatePhone: Number,
        email: String,
        label : String,
    },

    deliveryInstruction: {
        type: String,
        default: '',
    },

    paymentMethod: {
        type: String,
        enum: ['COD', 'Card'],
        default: 'COD'
    },

    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed'],
        default: 'Pending'
    },

    orderStatus: {
        type: String,
        enum: ['Pending', 'Shipped', 'Deliverd', 'Cancelled'],
        default: 'Pending'
    },

    grandTotal: {
        type: Number,
        required: true,
    },

    placedAt: {
        type: String,
        required: true,
    },

    deliveredAt: {
        type: String,
        // required: true,
    },
    cancel: {
        type: Boolean,
        default: false
    },

    cancelReason : {
        type : String,
        default : ''
    }

},
    { timestamps: true }
)



const orderModel = mongoose.model('Order', orderSchema)

module.exports = orderModel