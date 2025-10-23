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
    const userId = await userModel.find({}, { _id: 1 })
    console.log('getCustomer - userId =', userId);
    
    const customerss = await addressesModel.find({ user: userId, isDefault: true }, { _id: 1, city: 1, state: 1, user: 1 }).populate('user', 'email name phone')
    const flatend = customerss.map(customer => ({
        _id : customer.user?.id,
        // email: customer.user?.email,
        address : [customer.city, customer.state],
        // name: customer.user?.name,
        // phone : customer.user?.phone
        
    }))
    const ids = flatend.map(customer => customer._id)
    console.log('getCustomer - ids =', ids);

    console.log('getCustomer - flatend =', flatend);
    
    
    
    const custo = await userModel.updateMany({_id : ids} , {address: flatend})
    console.log('getCustomer - custo =', custo);

    
    // const customers = custo
    // console.log('getCustomers - address =', address);
    
    
    // const populate =  await addressesModel.find().populate('user')
    // console.log('getCustomers - populate =', populate);
    
    
    
    // const addingAddress = await userModel.updateMany({ _id: userId, }, { $set: { address: address} })
    // console.log('getCustomers - addingAddress =', addingAddress);
    const customers = await userModel.find().sort({ createdAt: -1 })
    console.log('getCustomers - customers =', customers);
    
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