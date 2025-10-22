// IMPORT DEPENDENCY
const asyncHandler = require('express-async-handler')
const productModel = require('../../models/products')

const getloginPageAdmin = asyncHandler(async (req, res) => {
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

    const products = await productModel.find().sort({ createdAt: -1 })
    return res.render('admin/products', { products })

})

const getCustomers = asyncHandler(async (req, res) => {
    const customers = [
        {
            id: 201,
            name: "Midhun P",
            email: "midhun@example.com",
            phone: "6889234567",
            address: "Kannur, Kerala",
            status: "Verified",
            totalOrders: 12,
            lastOrder: "2025-09-10"
        },
        {
            id: 202,
            name: "Sneha R",
            email: "sneha@example.com",
            phone: "9876543210",
            address: "Payyanur, Kerala",
            status: "Active",
            totalOrders: 5,
            lastOrder: "2025-09-12"
        },
        {
            id: 203,
            name: "Arjun K",
            email: "arjun@example.com",
            phone: "9447788990",
            address: "Taliparamba, Kerala",
            status: "Blocked",
            totalOrders: 2,
            lastOrder: "2025-08-30"
        }
    ];
    return res.render('admin/customers', { customers })

})

module.exports = {
    gethomePageAdmin,
    getloginPageAdmin,
    getOrdersAdmin,
    getProductsAdmin,
    getCustomers,

}