
// IMPORT DEPENDENCY
const express = require('express')
const router = express.Router()

// IMPORT MIDDLEWARE

const { upload } = require('../../middlewares/multer')

// IMPORT MODULES
const { loginAdmin, addProducts, editProducts,deleteProduct, addCustomers } = require('../../controllers/admin/authControllerAdmin')


// ---------------------------------------------------------LOGIN ROUTES
router.post('/admin/login', loginAdmin)

//-------------------------------------------------------PRODUCTS ROUTES
router.post('/admin/products/add', upload.single('images'), addProducts)
router.post('/admin/products/add', upload.single('images'), addProducts)
router.post('/admin/products/edit/:id', upload.single('images'), editProducts)
router.post('/admin/products/delete/:id', deleteProduct)

//-------------------------------------------------------CUSTOMER ROUTES
router.post('/admin/customers/add', addCustomers)



module.exports = router