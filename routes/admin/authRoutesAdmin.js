
// IMPORT DEPENDENCY
const express = require('express')
const router = express.Router()

// IMPORT MIDDLEWARE

const { upload } = require('../../middlewares/multer')

// IMPORT MODULES
const { loginAdmin, addProducts, editProducts, deleteProduct, blockCustomer, deleteCustomer, updateOrderStatus, createCoupon, updateCoupon, deleteCoupon, unblockCoupon, blockCoupon, sendReply, resolveButton } = require('../../controllers/admin/authControllerAdmin')


// ---------------------------------------------------------LOGIN ROUTES
router.post('/admin/login', loginAdmin)

//-------------------------------------------------------PRODUCTS ROUTES
router.post('/admin/products/add', upload.array('images', 4), addProducts)
// router.post('/admin/products/edit/:id', upload.single('images'), editProducts)
router.post('/admin/products/edit/:id', upload.array('images', 4), editProducts)
router.post('/admin/products/delete/:id', deleteProduct)

//-------------------------------------------------------CUSTOMER ROUTES

router.post('/admin/customers/toggle-status/:id', blockCustomer);
router.post('/admin/customers/delete/:id', deleteCustomer);

//-------------------------------------------------------ORDERS ROUTES

router.post('/admin/orders/update/:id', updateOrderStatus)

//-------------------------------------------------------COUPONS ROUTES

router.post('/admin/coupon/add', createCoupon)
router.post('/admin/coupon/edit/:id', updateCoupon)
router.delete('/admin/coupon/delete/:id', deleteCoupon)
router.patch('/admin/coupon/unblock/:id', unblockCoupon)
router.patch('/admin/coupon/block/:id', blockCoupon)

// ------------------------------------------------------ENQUIRY ROUTES AJAX

router.post('/admin/support/reply', sendReply)
router.post('/admin/support/resolve', resolveButton)

module.exports = router