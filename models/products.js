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
        type: Number,
        require: true
    },
    stock: {
        type: Number,
        default: 10
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'active',
    },
    category: {
        type: String,
        enum: ['Automatic', 'Manual', 'Limited-Edition',],
        require: true
    },
    image: {
        type: [String],
        default: [],
    },

    embedding: {
        type: [Number],
        default: []
    },

    averageRate: {
        type: Number,
        default: 0,
    },
    totalReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
            rating: { type: Number, min: 1, max: 5, required: true },
            comment: { type: String, trim: true },
            createdAt: { type: Date, default: Date.now },
        }
    ],
}, { timestamps: true })


const productModel = mongoose.model('product', productSchema)

module.exports = productModel 