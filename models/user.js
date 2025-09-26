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
        default: false,
        type: String,

    },
    password: {
        required: true,
        type: String,
    },
    role: {
        type: Boolean,
        enum: ["admin", 'user'],
        default: 'user'
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,

    },
},
    {
        timestamps: true,
    }

)

const userModel = mongoose.model('user', userSchema)
module.exports = userModel