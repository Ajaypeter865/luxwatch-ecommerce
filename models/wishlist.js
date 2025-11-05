const mongoose = require('mongoose')

const wishlistSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        require: true,
    },

    products: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product',
        }
    ]
})


const wishlistModel = mongoose.model('whislist', wishlistSchema)

module.exports = wishlistModel