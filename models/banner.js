const mongoose = require('mongoose')

const bannerSchema = new mongoose.Schema({
    main: {
        type: String,
        required: true,
    },
    sub: {
        type: String,
        required: true,
    },
    bannerImage: {
        type: String,
        required: true
    }
})



const bannerModel = mongoose.model('banner', bannerSchema)

module.exports = bannerModel