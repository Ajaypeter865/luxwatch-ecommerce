const express = require('express')
const router = express.Router()

const {signupUser} = require('../controllers/user/authController')

router.post('/signup', signupUser)

module.exports = router