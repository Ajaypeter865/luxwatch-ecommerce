const jwt = require('jsonwebtoken')
const userModel = require('../models/user')

const getToken = async (req) => {
    return req.cookies?.userToken
}

const resLocals = async (req, res, next) => {
    res.locals.user =  req.user || req.auth || null
    console.log('req.user', req.user, 'auth ', req.auth);

    return next()
}
const proctedAuth = async (req, res, next) => {
    // GOOGLE AUTHENTICATION
    try {
        if (req.user && req.user.googleId) {
            const googleUser = await userModel.findOne({ googleId: req.user.googleId })
            if (googleUser) return next()
        }

        // JWT AUTHENTICATION
        const token = await getToken(req)
        if (token) {
           const payload = jwt.verify(token, process.env.secretKey)
            req.auth = payload
            return next()
        }

        res.redirect('/login?error=Unauthenticated')
    } catch (error) {
        console.log('Error from proctedAuth = ', error.message, error.stack);
        res.redirect('/login?error=Servererror')

    }

}




module.exports = { proctedAuth, resLocals }