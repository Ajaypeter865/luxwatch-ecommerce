// IMPORT MIDDLEWARES
const express = require('express')
const router = express.Router()
const passport = require('passport')


// CONTROLLERS
const { signupUser, loginUser } = require('../controllers/user/authController')
const { signUpValidator, loginValidator } = require('../middlewares/validation')


router.post('/signup', signUpValidator, signupUser)
router.post('/login', loginValidator, loginUser)
router.get('/auth/google/callback', passport.Authenticator)


// 


module.exports = router