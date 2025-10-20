
// IMPORT DEPENDENCY
const express = require('express')
const router = express.Router()

// IMPORT MIDDLEWARE

// const upload = require('../middlewares/multer ')

const {upload} = require('../../middlewares/multer')

// IMPORT MODULES
const { loginAdmin, addProducts } = require('../../controllers/admin/authControllerAdmin')



router.post('/admin/login', loginAdmin)
router.post('/admin/products/add',upload.single('images'), addProducts)

module.exports = router