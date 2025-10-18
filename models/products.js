const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
        trim: true,
    },
    description: {
        type: String,
        require: true,
        trim: true,

    },
    brand: {
        type: String,
        require: true,
        trim: true,

    },
    price: {
        type: String,
        require: true
    },
    stock: {
        type: Number,
        default: 10
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
    category: {
        type: String,
        enum: ['automatic', 'manual', 'limited Edition'],
        require: true
    },
    image: {
        type: String,
        require: true
    },
    reviews: {
        type: String,

    }
}, { timestamps: true })


const productModel = mongoose.model('product', productSchema)

module.exports = { productModel }