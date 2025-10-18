// IMPORT DEPENDENCY
const asyncHandler = require('express-async-handler')

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

    const products = [
        {
            _id: "671a8e4c7b92d0f12a01",
            image: "/img/gallery/choce_watch2.png",
            name: "Classic Analog",
            category: "Analog",
            brand: "Titan",
            price: 12500,
            stock: 5,
            status: "Active"
        },
        {
            _id: "671a8e4c7b92d0f12a02",
            image: "/img/products/watch2.jpg",
            name: "Luxury Chronograph",
            category: "Luxury",
            brand: "Rolex",
            price: 788940,
            stock: 12,
            status: "Active"
        },
        {
            _id: "671a8e4c7b92d0f12a03",
            image: "/img/products/watch3.jpg",
            name: "SportX Pro",
            category: "Sports",
            brand: "Casio G-Shock",
            price: 18990,
            stock: 25,
            status: "Inactive"
        },
        {
            _id: "671a8e4c7b92d0f12a04",
            image: "/img/products/watch4.jpg",
            name: "Elite Dress Watch",
            category: "Luxury",
            brand: "Omega",
            price: 249999,
            stock: 8,
            status: "Active"
        },
        {
            _id: "671a8e4c7b92d0f12a05",
            image: "/img/products/watch5.jpg",
            name: "StreetRunner",
            category: "Sports",
            brand: "Fastrack",
            price: 4999,
            stock: 42,
            status: "Active"
        }
    ];
    return res.render('admin/products', { products })

})

module.exports = {
    gethomePageAdmin,
    getloginPageAdmin,
    getOrdersAdmin,
    getProductsAdmin,
}