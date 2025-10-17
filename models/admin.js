const { default: mongoose, model } = require("mongoose");

const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        require: true,
        default: false,
        lowercase: true,
    },
    password: {
        require: true,
        minlength: 4,
        type: String,
    }
})

const adminModel = mongoose.model('admin', adminSchema)
module.exports = adminModel