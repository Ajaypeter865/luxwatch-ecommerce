// IMPORT DEPENDENCY
const express = require('express')
const router = express.Router()
const passport = require('passport')

// IMPORT MODULES
const { proctedAuth, resLocals } = require('../middlewares/auth')

// IMPORT GET MODULES
const { profilePage ,address} = require('../controllers/user/authController')
const { getLoginUser, getSignupUser, getHomePage, getforgotPassword,
    getEnterOtp, getRestPassword, getLogout, getAddress } = require('../controllers/user/getController')


// USER ROUTES
router.get('/signup', getSignupUser)
router.get('/login', getLoginUser)
router.get('/forgotPassword', getforgotPassword)
// router.get('/enterotp', getEnterOtp)  
// router.get('/restpassword', getRestPassword)
router.get('/logout', proctedAuth, getLogout)



// HOME ROUTES
router.get('/profile', proctedAuth, profilePage)     // PROFILE PAGE COMEING FROM AUTHCONTROLLERS
router.get('/', proctedAuth, resLocals, getHomePage)  // IF NEED TO CHANGE THE HOME PAGE CHANGE THE '/' INTO '/INDEX'
router.get('/address', address)


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