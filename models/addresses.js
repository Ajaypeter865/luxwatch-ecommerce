const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema({
    user :{
        type: mongoose.Schema.Types.ObjectId,
        ref : 'User',
        require: true,
    },
    label: {    
        type: String,
        require:true,

    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true,
    },
    pincode: {
        type: Number,
        required: true,
    },
    addressLine: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    state: {
        required: true,
        type: String,

    },
    isDefault: {
        type: Boolean,
        default: false,
    }


}, { timestamps: true })


module.exports = mongoose.model('Address', addressSchema)