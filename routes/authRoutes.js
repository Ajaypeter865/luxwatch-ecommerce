const express = require('express')
const router = express.Router()

// CONTROLLERS

const { signupUser, loginUser, getLoginUser } = require('../controllers/user/authController')


router.post('/signup', signupUser)
router.post('/login', loginUser)


// 


module.exports = router