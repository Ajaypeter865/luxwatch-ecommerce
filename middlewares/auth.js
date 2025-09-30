const jwt = require('jsonwebtoken')
const userModel = require('../models/user')

const getToken = async (req) => {
    return req.cookies?.userToken
}

const proctedAuth = async (req, res, next) => {
    // GOOGLE AUTHENTICATION
    try {
        if (req.user && req.user.googleId) {
            const googleUser = await userModel.findOne({ googleId: req.user.googleId })
            if (googleUser) return next()
        }

        // JWT AUTHENTICATION

        const token = jwt.verify()

    }catch(error){

    }

}




module.exports = { proctedAuth }