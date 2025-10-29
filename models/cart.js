const mongoose = require('mongoose')

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
                type: String,
                required: true,
                default: 1,
                min: 1
            },
            price: {
                required: true,
                type: String,
            },
            totalPrice: {
                type: String,
                required: true,
            },

        }
    ],

    subTotal: {
        type: String,
        required: true,
    },

    shipping: {
        type: String,
        default: 0,
    },

    total: {
        type: String,
        required: true,
    },
}, 
{ timestamps: true }
)