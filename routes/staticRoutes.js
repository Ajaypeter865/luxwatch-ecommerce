const express = require('express')
const router = express.Router()


router.get('/', async (req, res) => {
    res.render('user/signup')
})

module.exports = router