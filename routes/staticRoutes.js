// IMPORT DEPENDENCY
const express = require('express')
const router = express.Router()
const passport = require('passport')

// IMPORT MODULES
const { proctedAuth } = require('../middlewares/auth')
const { getLoginUser, getSignupUser, getHomePage, profilePage } = require('../controllers/user/authController')

// ROUTES
router.get('/signup', getSignupUser)
router.get('/login', getLoginUser)
router.get('/profile', profilePage)

router.get('/', proctedAuth, getHomePage)

// GOOGLE AUTHENTICATION
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}))

router.get('/auth/google/callback', passport.authenticate('google', {

    failureRedirect: '/login?error=already',
    failureMessage: true
}),
    (req, res) => {

        res.redirect('/')
    })

module.exports = router