// IMPORT DEPENDENCY
const asyncHandler = require('express-async-handler')
const productModel = require('../../models/products')
const userModel = require('../../models/user')
const addressesModel = require('../../models/addresses')
const orderModel = require('../../models/order')
const couponModel = require('../../models/coupon')
const enquiryModel = require('../../models/enquiry')
const bannerModel = require('../../models/banner')


const getloginPageAdmin = asyncHandler(async (req, res) => {
  return res.render('admin/adminLogin')
})


const gethomePageAdmin = asyncHandler(async (req, res) => {
  const chartData = await generateChartData("monthly");

  // Summary Boxes
  const totalSales = await orderModel.aggregate([
    { $group: { _id: null, total: { $sum: "$grandTotal" } } }
  ]);
  const totalOrders = await orderModel.countDocuments();
  const pendingOrders = await orderModel.countDocuments({ orderStatus: "Pending" });
  const totalProducts = await productModel.countDocuments();
  const totalCustomers = await userModel.countDocuments();
  const newCustomers = await userModel.countDocuments({
    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
  });

  return res.render("admin/adminIndex", {
    dashboardData: {
      totalSales: totalSales[0]?.total || 0,
      totalOrders,
      pendingOrders,
      totalProducts,
      totalCustomers,
      newCustomers
    },
    chartData
  });
});


// Helper function to generate chart data based on filter
const generateChartData = async (filterType) => {
  let dateFilter;

  // --------------------------
  // 1️⃣ SET DATE RANGE
  // --------------------------
  if (filterType === "weekly") {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    dateFilter = { createdAt: { $gte: sevenDaysAgo } };

  } else if (filterType === "monthly") {
    const oneMonthAgo = new Date(new Date().setMonth(new Date().getMonth() - 1));
    dateFilter = { createdAt: { $gte: oneMonthAgo } };

  } else if (filterType === "yearly") {
    const oneYearAgo = new Date(new Date().setFullYear(new Date().getFullYear() - 1));
    dateFilter = { createdAt: { $gte: oneYearAgo } };

  } else if (filterType === "fiveYears") {
    const fiveYearsAgo = new Date(new Date().setFullYear(new Date().getFullYear() - 5));
    dateFilter = { createdAt: { $gte: fiveYearsAgo } };

  } else {
    const oneMonthAgo = new Date(new Date().setMonth(new Date().getMonth() - 1));
    dateFilter = { createdAt: { $gte: oneMonthAgo } };
  }

  // --------------------------
  // 2️⃣ DYNAMIC GROUPING LOGIC
  // --------------------------
  let groupStage;

  if (filterType === "fiveYears") {
    groupStage = {
      _id: { year: { $year: "$createdAt" } },
      total: { $sum: "$grandTotal" }
    };

  } else if (filterType === "yearly") {
    groupStage = {
      _id: { month: { $month: "$createdAt" } },
      total: { $sum: "$grandTotal" }
    };

  } else {
    groupStage = {
      _id: { day: { $dayOfMonth: "$createdAt" } },
      total: { $sum: "$grandTotal" }
    };
  }

  // --------------------------
  // 3️⃣ LINE CHART – REVENUE AGGREGATION
  // --------------------------
  const revenueAgg = await orderModel.aggregate([
    { $match: dateFilter },
    { $group: groupStage },
    { $sort: { "_id": 1 } }
  ]);

  let lineLabels = [];
  let lineRevenue = [];

  if (filterType === "fiveYears") {
    lineLabels = revenueAgg.map(r => r._id.year.toString());
    lineRevenue = revenueAgg.map(r => r.total);

  } else if (filterType === "yearly") {
    lineLabels = revenueAgg.map(r => "Month " + r._id.month);
    lineRevenue = revenueAgg.map(r => r.total);

  } else {
    lineLabels = revenueAgg.map(r => "Day " + (r._id.day || r._id));
    lineRevenue = revenueAgg.map(r => r.total);
  }

  // --------------------------
  // 4️⃣ BAR CHART – ORDERS BY CATEGORY
  // --------------------------
  const orderCategory = await orderModel.aggregate([
    { $match: dateFilter },
    { $unwind: "$orderItems" },
    {
      $lookup: {
        from: "products",
        localField: "orderItems.productId",
        foreignField: "_id",
        as: "productInfo"
      }
    },
    { $unwind: "$productInfo" },
    {
      $group: {
        _id: "$productInfo.category",
        totalOrders: { $sum: 1 }
      }
    }
  ]);

  const ordersByCategory = {
    Manual: orderCategory.find(c => c._id === "Manual")?.totalOrders || 0,
    "Limited-Edition": orderCategory.find(c => c._id === "Limited-Edition")?.totalOrders || 0,
    Automatic: orderCategory.find(c => c._id === "Automatic")?.totalOrders || 0
  };

  // --------------------------
  // 5️⃣ PIE CHART – REVENUE BY CATEGORY
  // --------------------------
  const revCategory = await orderModel.aggregate([
    { $match: dateFilter },
    { $unwind: "$orderItems" },
    {
      $lookup: {
        from: "products",
        localField: "orderItems.productId",
        foreignField: "_id",
        as: "productInfo"
      }
    },
    { $unwind: "$productInfo" },
    {
      $group: {
        _id: "$productInfo.category",
        totalRevenue: { $sum: "$orderItems.total" }
      }
    }
  ]);

  const revenueByCategory = {
    Manual: revCategory.find(c => c._id === "Manual")?.totalRevenue || 0,
    "Limited-Edition": revCategory.find(c => c._id === "Limited-Edition")?.totalRevenue || 0,
    Automatic: revCategory.find(c => c._id === "Automatic")?.totalRevenue || 0
  };

  return {
    lineLabels,
    lineRevenue,
    ordersByCategory,
    revenueByCategory
  };
};

// AJAX endpoint for chart filter updates
const getChartData = asyncHandler(async (req, res) => {
  const { filter } = req.query;
  console.log('getChartData - filter =', req.query);

  const chartData = await generateChartData(filter || "monthly");
  console.log('getChartData - chartData =', chartData);

  res.json(chartData);
});


//  (THIS GETORDERPAGE IS FOR SHOWING THE 1ST ITEM ONLY FROM THE ORDER ITEMS) !! DONT DELETE

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
      const productNames = order.orderItems.map(item => `${item.name} (x${item.quantity})`).join(', ')

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
        cancelReason: order.cancelReason
      };
    });

    console.log('getOrdersAdmin - formattedOrders =', formattedOrders);

    return res.render('admin/orders', { orders: formattedOrders });

  } catch (error) {
    console.log('Error from getOrdersAdmin =', error);
    return res.redirect('/error?orderadmin');
  }
});

// Assuming you have access to Mongoose and your productModel
// Adjust path as necessary

const getProductsAdmin = asyncHandler(async (req, res) => {

  const products = await productModel.find().sort({ createdAt: -1 });

  // 1. Define the hardcoded list of categories from your product schema
  const categories = ['Automatic', 'Manual', 'Limited-Edition'];

  // 2. Pass both 'products' AND 'categories' to the EJS view
  return res.render('admin/products', { products, categories });

});


const getCustomers = asyncHandler(async (req, res) => {
  const allUser = await userModel.find()

  const defaultAddress = await addressesModel.find({ isDefault: true }).populate('user', '_id').select('city state user')
  // console.log('getCustomers - defaultAddress =', defaultAddress);


  const addAddress = new Map()

  defaultAddress.forEach(address => {
    // console.log('getCustomers - addAddress =', addAddress);
     if (!address.user) return; 
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


const getCoupons = asyncHandler(async (req, res) => {
  try {

    const coupons = await couponModel.find()

    return res.render('admin/coupon', { coupons })

  } catch (error) {
    console.log('Error from getCoupon =', error.message, error.stack);
    return res.redirect('/error')

  }

})


const getSupport = asyncHandler(async (req, res) => {

  const enquiries = await enquiryModel.find()

  return res.render('admin/support', { enquiries })
})

const getBanner = asyncHandler(async (req, res) => {
  // const banners = await bannerModel.findOne().sort({ createdAt: -1 });
  const banners = await bannerModel.find()
  console.log('getBanner - banners =', banners);
  

  return res.render('admin/banner', { banners })

})







module.exports = {
  gethomePageAdmin,
  getloginPageAdmin,
  getOrdersAdmin,
  getProductsAdmin,
  getCustomers,
  getChartData,
  generateChartData,
  getCoupons,
  getSupport,
  getBanner,
}