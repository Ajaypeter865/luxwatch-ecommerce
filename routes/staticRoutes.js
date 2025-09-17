const express = require('express')
const router = express.Router()


router.get('/signup', async (req, res) => {
    res.render('user/signup')
})

// router.get('/login', async (req, res) => {
//   return  res.redirect('user/login')
// })

router.get('/', async (req, res) => {
    res.send('Hello from home')
})
module.exports = router