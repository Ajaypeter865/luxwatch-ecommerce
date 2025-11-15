// IMPORT DEPENDENCY
const asyncHandler = require('express-async-handler')
const productModel = require('../../models/products')
const userModel = require('../../models/user')
const addressesModel = require('../../models/addresses')
const orderModel = require('../../models/order')


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




// const getOrdersAdmin = asyncHandler(async (req, res) => {

//     try {
//         const orders = await orderModel.find().sort({ createdAt: -1 })
//         console.log('getOrdersAdmin - orders =', orders);

//         // return res.send('Hi')


//         const formattedOrders = orders.map(order => ({
//             productName: order.orderItems.name,
//             customerName: order.shippingAddress.fullName,
//             address: order.shippingAddress.addressLine,
//             phone: order.shippingAddress.phone,
//             grandTotal: order.grandTotal,
//             paymentStatus: order.paymentStatus,
//             cancelRequest: order.cancelRequest ? 'Requested' : 'Not requested'
//         }))

//         // console.log('getOrdersAdmin - formattedOrders =', formattedOrders);
//         console.log('getOrdersAdmin - formattedOrders =', formattedOrders);
        
//         return res.render('admin/orders', {
//             orders: formattedOrders
//         })

//     } catch (error) {
//         console.log('Error from getOrdersAdmin =', error);
//         return res.redirect('/error?orderadmin')

//     }

// })


const getOrdersAdmin = asyncHandler(async (req, res) => {
  try {
    const orders = await orderModel.find().sort({ createdAt: -1 });
    console.log('getOrdersAdmin - orders =', orders);

    const formattedOrders = orders.map(order => {
    //   const item = order.orderItems[0]; // First item
    const productNames  = order.orderItems.map(item => `${item.name} (x${item.quantity})`).join(', ')

      return {
        _id: order._id,
        productName: productNames,
        // quantity: item?.quantity || 0,
        customerName: order.shippingAddress.fullName,
        address: order.shippingAddress.addressLine,
        phone: order.shippingAddress.phone,
        grandTotal: order.grandTotal,
        status: order.orderStatus,
        paymentStatus: order.paymentStatus,
        cancel: order.cancel,
        cancelReason : order.cancelReason
      };
    });

    console.log('getOrdersAdmin - formattedOrders =', formattedOrders);

    return res.render('admin/orders', { orders: formattedOrders });

  } catch (error) {
    console.log('Error from getOrdersAdmin =', error);
    return res.redirect('/error?orderadmin');
  }
});

const getProductsAdmin = asyncHandler(async (req, res) => {

    const products = await productModel.find().sort({ createdAt: -1 })
    return res.render('admin/products', { products })

})


const getCustomers = asyncHandler(async (req, res) => {
    const allUser = await userModel.find()

    const defaultAddress = await addressesModel.find({ isDefault: true }).populate('user', '_id').select('city state user')
    // console.log('getCustomers - defaultAddress =', defaultAddress);


    const addAddress = new Map()

    defaultAddress.forEach(address => {
        // console.log('getCustomers - addAddress =', addAddress);
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