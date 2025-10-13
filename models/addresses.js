const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema({
    userId :{
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
    addressline: {
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