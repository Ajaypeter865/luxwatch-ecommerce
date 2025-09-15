const express = require('express')
const router = express.Router()
router.get('/', async (req, res) => {
    res.send('Hi from server')
})

module.exports = router