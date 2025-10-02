// IMPORT MIDDLEWARES
const express = require('express')
const router = express.Router()


// CONTROLLERS
const { signupUser, loginUser } = require('../controllers/user/authController')
const { signUpValidator, loginValidator } = require('../middlewares/validation')


router.post('/signup', signUpValidator, signupUser)
router.post('/login',loginValidator,  loginUser)   


module.exports = router