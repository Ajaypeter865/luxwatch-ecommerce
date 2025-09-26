const express = require('express')
const router = express.Router()
const passport = require('passport')


const { proctedAuth } = require('../middlewares/auth')
const { getLoginUser, getSignupUser, getHomePage } = require('../controllers/user/authController')


router.get('/signup', getSignupUser)
router.get('/login', getLoginUser)

router.get('/', proctedAuth, getHomePage)

// GOOGLE AUTHENTICATION
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}))

router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/signup' }),
    (req, res) => {
        
        res.redirect('/')
    })

module.exports = router