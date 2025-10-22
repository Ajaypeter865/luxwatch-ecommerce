// IMPORT DEPENDENCY

const express = require("express");
const router = express.Router()

// IMPORT MODULES
const { gethomePageAdmin, getloginPageAdmin, getOrdersAdmin, getProductsAdmin , getCustomers} = require('../../controllers/admin/getControllersAdmin')

// IMPORT MIDDLEWARE
const { proctedAuthAdmin, proctedAuth } = require('../../middlewares/auth')


// ROUTES
router.get('/admin/login', getloginPageAdmin)
router.get('/admin', proctedAuthAdmin, gethomePageAdmin)
router.get('/admin/orders', proctedAuthAdmin, getOrdersAdmin)
router.get('/admin/products', proctedAuthAdmin, getProductsAdmin)
router.get('/admin/customers',proctedAuth, getCustomers)


module.exports = router