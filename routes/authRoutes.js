// IMPORT MIDDLEWARES
const express = require('express')
const router = express.Router()


// CONTROLLERS
const { signupUser, loginUser, forgotPassword, verifyOtp } = require('../controllers/user/authController')

// MIDDLEWARES
const { signUpValidator, loginValidator } = require('../middlewares/validation')


router.post('/signup', signUpValidator, signupUser)
router.post('/login', loginValidator, loginUser)
router.post('/forgotpassword', forgotPassword)
router.post('/enterOtp', verifyOtp)



module.exports = router