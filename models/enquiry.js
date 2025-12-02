const mongoose = require('mongoose')

const enquirySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        requierd: true,
    },

    subject: {
        type: String,
        required: true,
        minlength: 3,
        maxLength: 50,
        trim: true,
    },

    message: {
        type: String,
        minlength: 3,
        maxLength: 150,
        trim: true,
    },

    status: {
        type: String,
        enum: ['Pending', 'Resovled'],
        default: 'Pending',
    },

    reply: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true })


const enquiryModel = mongoose.model('enquiry', enquirySchema)

module.exports = enquiryModel