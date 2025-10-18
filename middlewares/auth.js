// IMPORT DEPENDENCY
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')

// IMPORT MODULES
const userModel = require('../models/user')


const getTokenUser = async (req) => {
    return req.cookies?.userToken
}

const getTokenadmin = async (req) => {
    return req.cookies?.adminToken
}




const resLocals = async (req, res, next) => {
    res.locals.user = req.user || req.auth || null
    console.log('Function from resLocals: req.user', req.user, 'auth ', req.auth);

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
        const token = await getTokenUser(req)
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



const proctedAuthAdmin = asyncHandler(async (req, res, next) => {

    const token = await getTokenadmin(req)
    
    if(token) {

        const payload = jwt.verify(token, process.env.secretKey)
        req.admin = payload
        return next()
    }

   return res.redirect('/admin/login')
    
})



module.exports = { proctedAuth, resLocals ,proctedAuthAdmin }