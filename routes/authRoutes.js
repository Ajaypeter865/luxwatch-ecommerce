const express = require('express')
const router = express.Router()

const { signupUser, loginUser, getLoginUser } = require('../controllers/user/authController')

router.post('/signup', signupUser)
router.post('/login', loginUser)

router.get('/login', getLoginUser)

module.exports = router