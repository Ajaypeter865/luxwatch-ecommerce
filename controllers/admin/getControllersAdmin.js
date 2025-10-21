// IMPORT DEPENDENCY
const asyncHandler = require('express-async-handler')
const productModel = require('../../models/products')

const getloginPageAdmin = asyncHandler(async (req, res) => {
    // const errorMessage = req.flash('error')
    return res.render('admin/adminLogin')
})


const gethomePageAdmin = asyncHandler(async (req, res) => {
    const totalSales = []
    const totalOrders = []
    const pendingOrders = []
    const totalProducts = []
    const totalCustomers = []
    const newCustomers = []


    return res.render('admin/adminIndex', {
        dashboardData: {
            totalSales: totalSales[0]?.total || 0,
            totalOrders,
            pendingOrders,
            totalProducts,
            totalCustomers,
            newCustomers
        }, recentOrders: []
    })
})


const getOrdersAdmin = asyncHandler(async (req, res) => {

    const orders = []
    const formattedOrders = orders.map(order => ({
        _id: [],
        productName: [],
        customerName: [],
        address: [],
        phone: [],
        quantity: [],
        total: [],
        status: [],
        paymentStatus: [],
        cancelRequest: order.cancelRequest ? 'Requested' : 'No Request'
    }));
    return res.render('admin/orders', {
        orders: formattedOrders
    })

})

const getProductsAdmin = asyncHandler(async (req, res) => {

    const products = await productModel.find().sort({createdAt: -1})
    return res.render('admin/products', { products })

})

module.exports = {
    gethomePageAdmin,
    getloginPageAdmin,
    getOrdersAdmin,
    getProductsAdmin,
}