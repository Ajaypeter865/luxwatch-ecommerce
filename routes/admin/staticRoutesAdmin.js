// IMPORT DEPENDENCY
const express = require("express");
const router = express.Router()

// IMPORT MODULES
const { gethomePageAdmin, getloginPageAdmin, getOrdersAdmin, getProductsAdmin, getCustomers, getChartData, getCoupons, getSupport, getBanner } = require('../../controllers/admin/getControllersAdmin')

// IMPORT MIDDLEWARE
const { proctedAuthAdmin, proctedAuth } = require('../../middlewares/auth')


// ROUTES
router.get('/admin/login', getloginPageAdmin)

// Main dashboard - only render the page
router.get('/admin', proctedAuthAdmin, gethomePageAdmin)

// AJAX endpoint for chart filter updates - MUST be separate route
router.get('/admin/chart-data', proctedAuthAdmin, getChartData)

router.get('/admin/orders', proctedAuthAdmin, getOrdersAdmin)
router.get('/admin/products', proctedAuthAdmin, getProductsAdmin)
router.get('/admin/customers', proctedAuthAdmin,getCustomers)
router.get('/admin/support',proctedAuthAdmin, getSupport)
router.get('/admin/coupons', getCoupons)

router.get('/admin/banner', proctedAuthAdmin,getBanner)


module.exports = router