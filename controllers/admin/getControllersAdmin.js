// IMPORT DEPENDENCY
const asyncHandler = require('express-async-handler')


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
        },   recentOrders: []
    })
})

const getloginPageAdmin = asyncHandler(async (req, res) => {
    return res.render('admin/adminLogin')
})

module.exports = {
    gethomePageAdmin,
    getloginPageAdmin
}