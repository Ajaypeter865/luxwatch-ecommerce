const express = require('express')
const router = express.Router()

const { proctedAuth } = require('../middlewares/auth')
const { getLoginUser, getSignupUser } = require('../controllers/user/authController')


router.get('/signup', getSignupUser)
router.get('/login', getLoginUser)

router.get('/', proctedAuth, async (req, res) => {
    return res.send('Hello from home')
})
module.exports = router