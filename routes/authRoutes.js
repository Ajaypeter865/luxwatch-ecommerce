// IMPORT MIDDLEWARES
const express = require('express')
const router = express.Router()


// CONTROLLERS
const { signupUser, loginUser, forgotPassword, verifyOtp, restPassword, editProfile } = require('../controllers/user/authController')

// MIDDLEWARES
const { signUpValidator, loginValidator } = require('../middlewares/validation')


router.post('/signup', signUpValidator, signupUser)
router.post('/login', loginValidator, loginUser)
router.post('/forgotpassword', forgotPassword)
router.post('/enterOtp', verifyOtp)
router.post('/resetpassword', restPassword)
router.post('/editProfile', editProfile)



module.exports = router