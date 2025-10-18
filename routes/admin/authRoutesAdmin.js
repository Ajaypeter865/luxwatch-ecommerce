
// IMPORT DEPENDENCY
const express = require('express')
const router = express.Router()

// IMPORT MIDDLEWARE

// IMPORT MODULES
const { loginAdmin } = require('../../controllers/admin/authControllerAdmin')



router.post('/admin/login',loginAdmin)

module.exports = router