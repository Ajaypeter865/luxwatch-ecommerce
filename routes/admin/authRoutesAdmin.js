
// IMPORT DEPENDENCY
const express = require('express')
const router = express.Router()

// IMPORT MIDDLEWARE

// IMPORT MODULES
const { loginAdmin, addProducts } = require('../../controllers/admin/authControllerAdmin')



router.post('/admin/login', loginAdmin)
router.post('/admin/products/add', addProducts)

module.exports = router