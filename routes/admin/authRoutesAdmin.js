
// IMPORT DEPENDENCY
const express = require('express')
const router = express.Router()

// IMPORT MIDDLEWARE

const { upload } = require('../../middlewares/multer')

// IMPORT MODULES
const { loginAdmin, addProducts, editProducts, deleteProduct, blockCustomer, deleteCustomer } = require('../../controllers/admin/authControllerAdmin')


// ---------------------------------------------------------LOGIN ROUTES
router.post('/admin/login', loginAdmin)

//-------------------------------------------------------PRODUCTS ROUTES
router.post('/admin/products/add', upload.single('images'), addProducts)
router.post('/admin/products/add', upload.single('images'), addProducts)
router.post('/admin/products/edit/:id', upload.single('images'), editProducts)
router.post('/admin/products/delete/:id', deleteProduct)

//-------------------------------------------------------CUSTOMER ROUTES

router.post('/admin/customers/toggle-status/:id', blockCustomer);
router.post('/admin/customers/delete/:id', deleteCustomer);

module.exports = router