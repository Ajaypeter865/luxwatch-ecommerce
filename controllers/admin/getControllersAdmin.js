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
    // const userId =  await userModel.find({})
    const userId =  await userModel.find({}, {_id: 1})
    console.log('getCustomer - userId =', userId);
    const address = await addressesModel.find({isDefault : true}, { _id : 0,city: 1, state: 1 })
    console.log('getCustomers - address =', address);
    // const listedCustomers = await userModel.find().sort({ createdAt: -1 })
    
    // const address = await addressesModel.find()
    // const customers= await addressesModel.find()
    
    const isDef =  await addressesModel.find({user: userId,isDefault : true}, { user: 1, })
    console.log('getCustomers - isDef =', isDef);
    const [{user}] = isDef
    console.log('getCustomers - user =', user);
    
    const  addingAddress = await userModel.updateMany({ _id: user}, {$set : {address : address}})
    console.log('getCustomers - addingAddress =', addingAddress);
    const customers = await userModel.find().sort({ createdAt: -1 })
    return res.render('admin/customers', { customers })

    
    // console.log('getCustomers - customers =', customers);


})

module.exports = {
    gethomePageAdmin,
    getloginPageAdmin,
    getOrdersAdmin,
    getProductsAdmin,
    getCustomers,

}