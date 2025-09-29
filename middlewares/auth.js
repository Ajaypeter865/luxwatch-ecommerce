const jwt = require('jsonwebtoken')
const userModel = require('../models/user')

const getToken = async (req) => {
    return req.cookies?.userToken
}

const proctedAuth = async (req, res, next) => {

    const token = await getToken(req)
    console.log('Token', token);


    if (req.user && req.user.googleId) {
        var googleUser = await userModel.findOne({ googleId: req.user.googleId })
        console.log('Google user', googleUser);


        if (googleUser) {
            return next()
        }
    }


    // const googleUser1 = req.user && req.user.googleId
    // const googleUser = await userModel.findOne({googleId: req.user.googleId})
    // console.log('Googleuser ', googleUser);


    console.log('Hiting token ');
    if (token || googleUser) {
        const payload = await jwt.verify(token, process.env.secretKey)
        req.auth = payload
        console.log('Going to next ');

        return next()
    } else {
        console.error('Error from proctedAuth =');
        res.redirect('/login?error:Hey')


    }


   
}


module.exports = { proctedAuth }