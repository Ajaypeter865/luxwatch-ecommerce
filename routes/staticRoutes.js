// IMPORT DEPENDENCY
const express = require('express')
const router = express.Router()
const passport = require('passport')

// IMPORT MODULES
const { proctedAuth, resLocals } = require('../middlewares/auth')

// IMPORT GET MODULES
const { profilePage } = require('../controllers/user/authController')
const { getLoginUser, getSignupUser, getHomePage, getforgotPassword, getEnterOtp, getRestPassword } = require('../controllers/user/getController')


// USER ROUTES
router.get('/signup', getSignupUser)
router.get('/login', getLoginUser)
router.get('/forgotPassword', getforgotPassword)
// router.get('/enterotp', getEnterOtp)
// router.get('/restpassword', getRestPassword)



// HOME ROUTES
router.get('/profile', proctedAuth, profilePage)
router.get('/', proctedAuth, resLocals, getHomePage)  // IF NEED TO CHANGE THE HOME PAGE CHANGE THE '/' INTO '/INDEX'


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