// IMPORT DEPENDENCY
const asyncHandler = require('express-async-handler')
const productModel = require('../../models/products')
const userModel = require('../../models/user')
const addressesModel = require('../../models/addresses')

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
    const allUser = await userModel.find()

    const defaultAddress = await addressesModel.find({ isDefault: true }).populate('user', '_id').select('city state user')
    console.log('getCustomers - defaultAddress =', defaultAddress);


    const addAddress = new Map()

    defaultAddress.forEach(address => {
        console.log('getCustomers - addAddress =', addAddress);
        addAddress.set(address.user._id.toString(), `${address.city} ${address.state}`)
        // console.log('getCustomers - addAddress =', addAddress);

    })
    const customers = allUser.map(user => ({
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        status: user.status,
        address: addAddress.get(user._id.toString()) || 'No Default Address',
    }))
    return res.render('admin/customers', { customers })
})








module.exports = {
    gethomePageAdmin,
    getloginPageAdmin,
    getOrdersAdmin,
    getProductsAdmin,
    getCustomers,

}