// IMPORT DEPENDENCY
const express = require('express')
const router = express.Router()
const passport = require('passport')

// IMPORT MODULES
const { proctedAuth, resLocals } = require('../middlewares/auth')

const {editProfile} = require('../controllers/user/authController')

// IMPORT GET MODULES
const { getLoginUser, getSignupUser, getHomePage, getforgotPassword, getEnterOtp,
    getRestPassword, getLogout, getProfilePage, getAddressPage
} = require('../controllers/user/getController')
const userModel = require('../models/user')

// USER ROUTES
router.get('/signup', getSignupUser)
router.get('/login', getLoginUser)
router.get('/forgotPassword', getforgotPassword)
// router.get('/enterotp', getEnterOtp)  
// router.get('/restpassword', getRestPassword)
router.get('/logout', proctedAuth, getLogout)



// HOME ROUTES
router.get('/profile', proctedAuth, getProfilePage)     // PROFILE PAGE COMEING FROM AUTHCONTROLLERS
router.get('/', proctedAuth, resLocals, getHomePage)  // IF NEED TO CHANGE THE HOME PAGE CHANGE THE '/' INTO '/INDEX'
router.get('/address', proctedAuth, getAddressPage)




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