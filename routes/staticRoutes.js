const express = require('express')
const router = express.Router()

const { proctedAuth } = require('../middlewares/auth')
const { getLoginUser, getSignupUser, getHomePage } = require('../controllers/user/authController')


router.get('/signup', getSignupUser)
router.get('/login', getLoginUser)

router.get('/', proctedAuth, getHomePage)
module.exports = router