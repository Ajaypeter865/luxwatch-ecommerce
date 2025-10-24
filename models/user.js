const { name } = require('ejs')
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        required: true,
        type: String,
    },
    email: {
        required: true,
        unique: false,
        type: String,
    },
    phone: {
        required: true,
        unique: false,
        type: String,

    },
    password: {
        required: function () { return !this.googleId },
        type: String,

    },
    role: {
        type: String,
        enum: ["admin", 'user'],
        default: 'user'
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,


    },
    status: {
        type: String,
        enum: ['Active', 'Blocked'],
        default: 'Active',

    },
       resetOtp: Number,
    otpExpires: Date,
},
    {
        timestamps: true,
    }

)

const userModel = mongoose.model('user', userSchema)
module.exports = userModel