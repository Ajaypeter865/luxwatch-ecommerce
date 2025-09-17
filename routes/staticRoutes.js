const express = require('express')
const router = express.Router()


router.get('/signup', async (req, res) => {
    res.render('user/signup')
})

router.get('/login', async (req, res) => {
    res.render('user/login', { success: null, error: null })
})
module.exports = router