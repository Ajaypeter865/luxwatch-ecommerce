const express = require('express')
const router = express.Router()

const { proctedAuth } = require('../middlewares/auth')
const { getLoginUser } = require('../controllers/user/authController')


router.get('/signup', async (req, res) => {
    res.render('user/signup')
})

router.get('/login', getLoginUser)

router.get('/', proctedAuth, async (req, res) => {
    res.send('Hello from home')
})
module.exports = router