const jwt = require('jsonwebtoken')
const userModel = require('../models/user')

const getToken = async (req) => {
    return req.cookies?.userToken
}

const proctedAuth = async (req, res, next) => {

    const token = await getToken(req)

    if (req.user && req.user.googleId) {
        const googleUser = await userModel.findOne({ googleId: req.user.googleId })

        if (googleUser) {
            return next()
        }
    }

    if (!token) return res.redirect('/login')
    try {

        const payload = await jwt.verify(token, process.env.secretKey)
        req.auth = payload
        return next()

    } catch (error) {
        console.log('Error from proctedAuth = ', error.message, error.stack);
        res.redirect('/login?error:Hey')

    }
}


module.exports = { proctedAuth }