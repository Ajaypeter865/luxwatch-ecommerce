// IMPORT DEPENDENCY
const express = require('express')
const router = express.Router()
const passport = require('passport')

// IMPORT MODULES
const { proctedAuth, resLocals } = require('../middlewares/auth')
const { getLoginUser, getSignupUser, getHomePage, profilePage } = require('../controllers/user/authController')


// ROUTES
router.get('/signup', getSignupUser)
router.get('/login', getLoginUser)


router.get('/profile', proctedAuth, profilePage)

 //                                                              DEBUGGING REQ.USER

// router.get('/profile', proctedAuth, async (req, res) => {
//     console.log('Running profile');
//     console.log('req.auth', req.auth);

//     res.render('user/profile', {user: req.auth, orders:null})

// })
//................................. 


router.get('/', proctedAuth, resLocals,getHomePage)


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