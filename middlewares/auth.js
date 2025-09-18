const jwt = require('jsonwebtoken')

const getToken = async (req) => {
    return req.cookies.userToken
}

const proctedAuth = async (req, res, next) => {

    const token = getToken(req)
    if (!token) return res.redirect('/login')

    try {
        const payload = jwt.verify(token, process.env.secretKey)
        req.auth = payload
        next()

    } catch (error) {
        console.log('Error from proctedAuth = ', error.message, error.stack);
        res.redirect('/login')

    }
}

module.exports = { proctedAuth }