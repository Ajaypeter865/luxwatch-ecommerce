// IMPORT MODULES
const addressModel = require('../../models/addresses')
const userModel = require('../../models/user')
const productModel = require('../../models/products')
const asyncHandler = require('express-async-handler')
const cartModel = require('../../models/cart')
const wishlistModel = require('../../models/wishlist')
const orderModel = require('../../models/order')
const { report } = require('../../routes/user/staticRoutes')
const couponModel = require('../../models/coupon')
const utils = require('../../utils/helpers')
const { ensureEmbeddingForProduct } = require('../../lib/embeddings');
const mongoose = require('mongoose');

//------------------------------------------------------ REGISTER FUNCTIONS
const getLoginUser = async (req, res) => {
    return res.render('user/login', {
        success: null, error: null,
    })
}

const getSignupUser = async (req, res) => {
    return res.render('user/signup', { success: null, error: null })
}


const getforgotPassword = async (req, res) => {
    return res.render('user/forgotPassword', { message: null })
}

const getHomePage = async (req, res) => {

    try {
        // NEED TO RENDER PRODUCTS HERE
        products = await productModel.find()

        return res.render('user/index', {
            products,
            success: null,
            error: null,
            user: res.locals
        })
    } catch (error) {
        console.log(`Error from getHomePage:`, error.stack, error.message);
    }

}

const getEnterOtp = async (req, res) => {
    return res.render('user/enterOtp', { message: null, email })
}

const getRestPassword = async (req, res) => {
    return res.render('user/restPassword', { message: null, userId: null, email: null })
}

const getLogout = async (req, res) => {
    return res.render('user/logout')

}


// -----------------------------------------------------PROFILE FUNCTIONS
const getProfilePage = async (req, res) => {
    try {
        console.log(`Fucntion from profilePage : ${req.user} = user .!!,${req.auth} = auth`);
        if (req.user || req.auth) {
            // return res.render('user/profile', { success: null, error: 'error' , products: null})

            return res.render('user/profile', { orders: null, user: req.auth || req.user || null })

            // return res.render('user/profile', { orders: null, user: await userModel.findByOne(id) })  //TRY FOR SIDEBAR USER


        } else {
            return res.render('user/profile', { success: null, error: 'No user found', products: null })
            // return res.render('user/index', { orders: null, user:  req.user })
        }
    } catch (error) {
        console.log('Error from profilePage = ', error.stack, error.message);
        return res.redirect('/error?profile')
    }
}




const getAddressPage = async (req, res) => {

    try {

        console.log(`getAddressPage : ${req.user} = user .!!,${req.auth} = auth`);
        // const user = await userModel.findOne({ id: req.auth.id })
        // console.log('getAddressPage - user =', user);
        // return res.render('user/address', { addresses: null, user: user })

        if (req.user) {
            // console.log('getAddressPage - req.auth =', req.auth   );

            // const user = await userModel.findOne({
            //     $or: [{ user: req.auth.id }, { user: req.user.id }]
            // })
            const user = await userModel.findById(req.user.id)
            const address = await addressModel.find({ user: req.user.id }).sort({ createdAt: -1 })

            console.log('getAddressPage - user.user =', user);

            // console.log('getAddressPage - user =', user);
            //  return res.render('user/address', { addresses: null, user: req.auth || req.user || null })
            return res.render('user/address', { addresses: address, user: user || req.auth })

        }
        if (req.auth) {
            const user = await userModel.findById(req.auth.id)
            const address = await addressModel.find({ user: req.auth.id }).sort({ createdAt: -1 })
            console.log('getAddressPage - user.auth =', req.auth);
            return res.render('user/address', { addresses: address, user: user })

        } else {
            return res.render('user/address', { error: 'No user found', addresses: null })
        }
    } catch (error) {
        console.log('Error from addressPage = ', error.stack, error.message);
        return res.render('user/address', { addresses: null, })

    }
}


const getUserOrdersPage = asyncHandler(async (req, res) => {

    try {

        const userId = req.auth?.id || req.user?.id

        const user = await userModel.findById(userId).select('name phone email')

        const orderId = await orderModel.find({ user: userId, cancel: false })

        const orders = orderId.map(order => ({
            _id: order.id,
            orderStatus: order.orderStatus,
            total: order.grandTotal,
            paymentMethod: order.paymentMethod,
            createdAt: order.createdAt.toISOString(),

            items: order.orderItems.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
            }))
        }))

        return res.render('user/profile', {
            user, orders
        })

    } catch (error) {
        console.log('Error from getUserOrdersPage =', error.stack, error.message);
        return res.redirect('/error')

    }

})
// -----------------------------------------------------SHOP FUNCTIONS


const getShopPage = asyncHandler(async (req, res) => {
    try {
        // 🧭 Get query params
        const { category, sort } = req.query;

        // 🗂️ Define your fixed categories (for dropdown)
        const categories = [
            { name: "Automatic", slug: "Automatic" },
            { name: "Manual", slug: "Manual" },
            { name: "Limited Edition", slug: "Limited-Edition" },
        ];

        // 🧩 Step 1: Filter by category if selected
        let filter = {};
        if (category) filter.category = category;

        // 🧩 Step 2: Fetch filtered products
        let products = await productModel.find(filter);

        // 🧩 Step 3: Apply sorting based on query
        if (sort === "low-high") {
            products.sort((a, b) => a.price - b.price);
        } else if (sort === "high-low") {
            products.sort((a, b) => b.price - a.price);
        } else if (sort === "newest") {
            products.sort((a, b) => b.createdAt - a.createdAt);
        }

        // 🧩 Step 4: Render page
        return res.render("user/shop", {
            products,
            categories,
            category: category || "",
            sort: sort || "",
            // success: req.flash("success"),  // THIS IS THE MAIN PROBLEM THAT I FACE OF TOASTIFY IS ASWOME PROBLEM
            // error: req.flash("error"),
        });
    } catch (error) {
        console.error("Error loading shop page:", error.message);
        req.flash("error", "Server error loading shop page");
        return res.redirect("/");
    }
});



// -----------------------------------------------------CART FUNCTIONS

//  THIS IS THE GETCART PAGE DONE BY ME IT SELF
// const getCartPage = asyncHandler(async (req, res) => {

//     const userId = req.auth?.id || req.user?.id

//     let cart = await cartModel.findOne({ user: userId }).populate('products.product', 'name image  price ').populate('coupons')
//     // console.log('getCartPage - cart1 =', cart);

//     const appliedCoupon = await couponModel.findOne({ usedBy: userId }).select('code _id discountValue') 
//     console.log('getCartPage - appliedCoupon =', appliedCoupon);



//     if (appliedCoupon) {
//         cart.coupons.push(appliedCoupon)
//         cart.coupons[cart.coupons.length - 1].couponName.push(appliedCoupon.code)
//         // cart.coupons[cart.coupons.length -1].discountValue.push(appliedCoupon.discountValue)
//     }

//     console.log('getCartPage - cart =', cart);

//     // await cart.save()
//     if (!cart || !cart.products || cart.products.length === 0) {
//         // console.log('Enter if Block');

//         return res.render('user/cart', {
//             cartItems: [],
//             totals: { subTotal: 0, shipping: 0, grandTotal: 0 }, appliedCoupon 
//         })
//     }

//     const validProducts = cart.products.filter((item) => item.product !== null)

//     const cartItems = validProducts.map(item => ({
//         _id: item.product._id,
//         name: item.product.name,
//         image: item.product.image,
//         price: Number(item.product.price),
//         quantity: item.quantity,
//         total: item.product.price * item.quantity,
//     }));

//     cart.subTotal = cart.products.reduce((sum, item) => sum + item.subTotal, 0)
//     cart.grandTotal = cart.products.reduce((sum, item) => sum + item.subTotal, 0) + cart.shipping
//     // console.log('getCartPage - cart.subTotal =', cart.subTotal);

//     const totals = {
//         shipping: cart.shipping,
//         grandTotal: cart.grandTotal,
//         subTotal: cart.subTotal,
//     }

//     // const appliedCoupon = null

//     // console.log('getCartPage - totals =', totals);

//     return res.render("user/cart", { cartItems, totals, appliedCoupon });

// });


// THIS IS THE GETCARTPAGE BY GPT - FOR COUPON CODE
const getCartPage = asyncHandler(async (req, res) => {
    const userId = req.auth?.id || req.user?.id;

    let cart = await cartModel.findOne({ user: userId })
        .populate('products.product', 'name image price') // product fields
        .populate('appliedCoupon.coupon', 'code discountType discountValue');

    if (!cart) {
        // Create empty cart if not exist (optional)
        cart = new cartModel({
            user: userId,
            products: [],
            subTotal: 0,
            shipping: 0,
            grandTotal: 0,
            appliedCoupon: null
        });
        await cart.save();
    }

    // filter out deleted product refs
    const validProducts = cart.products.filter(p => p.product !== null);

    const cartItems = validProducts.map(item => ({
        _id: item.product._id,
        name: item.product.name,
        image: item.product.image,
        price: Number(item.price || item.product.price || 0),
        quantity: item.quantity,
        total: Number(item.totalPrice || (item.price * item.quantity) || 0)
    }));

    // Recalculate totals from DB fields to ensure correctness
    await utils.recalcCartTotals(cart);
    await cart.save();

    const totals = {
        subTotal: cart.subTotal || 0,
        shipping: cart.shipping || 0,
        grandTotal: cart.grandTotal || 0
    };

    // applied coupon object (null or object with fields code, discountValue, discountAmount)
    const appliedCoupon = cart.appliedCoupon ? {
        code: cart.appliedCoupon.code,
        discountType: cart.appliedCoupon.discountType,
        discountValue: cart.appliedCoupon.discountValue,
        discountAmount: cart.appliedCoupon.discountAmount
    } : null;

    return res.render('user/cart', { cartItems, totals, appliedCoupon });
});

//GET CART PAGE GPT
// const getCartPage = asyncHandler(async (req, res) => {
//     const userId = req.auth?.id || req.user?.id;

//     let cart = await cartModel
//         .findOne({ user: userId })
//         .populate('products.product', 'name image price');

//     if (!cart || !cart.products || cart.products.length === 0) {
//         return res.render('user/cart', {
//             cartItems: [],
//             totals: { subTotal: 0, shipping: 0, grandTotal: 0 },
//         });
//     }

//     // ✅ Filter out items with null product (deleted)
//     const validProducts = cart.products.filter(
//         (item) => item.product !== null
//     );

//     const cartItems = validProducts.map((item) => ({
//         _id: item.product._id,
//         name: item.product.name,
//         image: item.product.image,
//         price: Number(item.product.price),
//         quantity: item.quantity,
//         total: Number(item.product.price) * item.quantity,
//     }));

//     // ✅ Safely calculate totals
//     const subTotal = cartItems.reduce((sum, item) => sum + item.total, 0);
//     const shipping = cart.shipping || 10;
//     const grandTotal = subTotal + shipping;

//     // Optionally clean invalid items from DB to prevent future errors
//     if (validProducts.length !== cart.products.length) {
//         cart.products = validProducts;
//         cart.subTotal = subTotal;
//         cart.shipping = shipping;
//         cart.grandTotal = grandTotal;
//         await cart.save();
//     }

//     const totals = { subTotal, shipping, grandTotal };

//     return res.render('user/cart', { cartItems, totals });
// });

// -----------------------------------------------------WISHLIST FUNCTIONS


// -----------------------------------------------------WISHLIST FUNCTIONS

const getWishList = async (req, res) => {
    try {
        const userId = req.auth?.id || req.user?.id

        const wishlistProducts = await wishlistModel.findOne({ user: userId }).populate('products', 'image name price')
        // console.log('getWishList - wishlistProducts 1  =', JSON.stringify(wishlistProducts[0].products, null, 2))   // METHORD TO DESTRUCTURE OBJECT IN AN ARRAY

        if (!wishlistProducts) {

            return res.render('user/wishlist', { wishlistItems: [] })
        }
        // console.log('getWishlist - wishlistItems 2 =', wishlistProducts);

        const wishlistItems = wishlistProducts.products.map(item => ({
            _id: item._id,
            name: item.name,
            price: Number(item.price),
            image: item.image
        }))

        // console.log('getWishlist - wishlistItems', wishlistItems);
        return res.render('user/wishlist', { wishlistItems })

    } catch (error) {
        console.log('Error from getWishList =', error.message, error.stack);
        return res.render('user/wishlist', { wishlistItems: [] })
    }

}

// -----------------------------------------------------PRODUCT DETAILS FUNCTIONS


// THIS IS THE GETPRODUCT PAGE WITHOUT AI 
// const getproductPage = async (req, res) => {
//     try {
//         const productId = req.params.id

//         const product = await productModel.findOne({ _id: productId })
//         // console.log('getProductPage - product =', product);


//         return res.render('user/product', { product })
//     } catch (error) {
//         console.log('Error from getProductPage =', error.message, error.stack);
//         return res.redirect(`/shop${error}`)
//     }

// }


//THIS IS THE GETPRODUCT PAGE WITH AI (NEW)
const getproductPage = async (req, res) => {
    try {
        const productId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).send('Invalid product ID');
        }

        // Get product (lean version)
        const product = await productModel.findById(productId).lean();
        if (!product) {
            return res.status(404).render('user/404');
        }

        // Get full document (non-lean) for saving embedding
        const productDoc = await productModel.findById(productId);
        await ensureEmbeddingForProduct(productDoc);

        // Fetch updated version with embedding
        const freshProduct = await productModel.findById(productId).lean();

        // If still no embedding → fallback
        if (!freshProduct.embedding || freshProduct.embedding.length === 0) {
            const fallback = await productModel
                .find({ _id: { $ne: productId } })
                .limit(4)
                .lean();

            return res.render('user/product', {
                product: freshProduct,
                suggestions: fallback
            });
        }

        // -------------------------------
        //   VECTOR SEARCH (AI SUGGESTIONS)
        // -------------------------------
        const agg = [
            {
                $search: {
                    index: 'default', // MUST match Atlas index name
                    knnBeta: {
                        vector: freshProduct.embedding,
                        path: 'embedding',
                        k: 6
                    }
                }
            },
            { $match: { _id: { $ne: freshProduct._id } } },
            { $limit: 6 },
            {
                $project: {
                    name: 1,
                    price: 1,
                    image: 1,
                    description: 1,
                    category: 1,
                    status: 1
                }
            }
        ];

        const results = await productModel.aggregate(agg).allowDiskUse(true);

        const suggestions = results.slice(0, 4);

        return res.render('user/product', {
            product: freshProduct,
            suggestions
        });

    } catch (error) {
        console.log('Error from getProductPage =', error.message, error.stack);
        return res.redirect(`/shop${error}`)
    }
};

// -----------------------------------------------------CHECKOUT FUNCTIONS

const getCheckoutPage = asyncHandler(async (req, res) => {

    try {

        const userId = req.auth?.id || req.user?.id

        const user = await userModel.findOne({ _id: userId })
        // console.log('getCheckOutPage - user = ', user);

        const addresses = await addressModel.find({ user: userId }).select('label addressLine')
        // console.log('getCheckOutPage - address =', address);

        const cart = await cartModel.findOne({ user: userId }).populate('products.product', 'name price')
        // console.log('getCheckOutPage - cart =', cart);

        const cartItems = cart.products.map(item => ({
            name: item.product.name,
            quantity: item.quantity,
            total: item.product.price * item.quantity

        }))

        // console.log('getCheckOutPage - cartItems =', cartItems);
        const subTotal = cart.subTotal

        const shipping = cart.shipping

        const grandTotal = cart.grandTotal

        return res.render('user/checkout', { user, addresses, cartItems, totals: { subTotal, shipping, grandTotal }, productId: null })

    } catch (error) {
        console.log('Error in getCheckoutPage =', error.stack, error.message);
        return res.redirect('/error')
    }

})



// THIS FUNCTION IS FOR WHEN WE DO BUY NOW FROM PRODUCT DISCRIPTION THIS FUNCTION WILL WORK
const getCheckoutPageByProduct = asyncHandler(async (req, res) => {
    try {

        const userId = req.auth?.id || req.user?.id
        const user = await userModel.findOne({ _id: userId })

        const addresses = await addressModel.find({ user: userId }).select('label addressLine')
        // console.log('getCheckoutPageByProduct - address =', addresses);


        const productId = req.params.id
        console.log('getCheckoutPageByProduct - productId =', productId);

        const cart = await productModel.findById(productId)
        // console.log('getCheckoutPageByProduct - cart =', cart);

        const cartItems = [{
            name: cart.name,
            quantity: 1,
            total: cart.price,
        }]

        // shipping: 10

        // console.log('getCheckoutPageByProduct - cartItems =', cartItems);

        const subTotal = cart.price

        const shipping = 10

        const grandTotal = Number(subTotal) + Number(shipping)


        return res.render('user/checkout', { user, addresses, cartItems, totals: { subTotal, shipping, grandTotal } })

    } catch (error) {
        console.log('Error from getCheckoutPageByProduct =', error.message, error.stack);
        return res.send('Error')


    }

})


const getOrderSummaryPage = asyncHandler(async (req, res) => {
    const orderId = req.params.id
    // console.log('getOrderPageSummary - orderId =', orderId);

    const order = await orderModel.findOne({ _id: orderId })
    // console.log('getOrderPageSummary - order =', order);


    return res.render('user/orderConfirmation', { order })

})





// --------------------------------------------------------ERROR PAGE

const errorPage = async (req, res) => {

    return res.render('user/404')

}

// -------------------------------------------------------CONTACT PAGE

const getContactPage = asyncHandler(async (req, res) => {

    return res.render('user/contact')
})


// ------------------------------------------------------- ABOUT PAGE

const getAboutPage = asyncHandler(async (req, res) => {
    try {
        return res.render('user/about')
    } catch (error) {
        console.log('Error in getAboutPage =', error.stack, error.message);
        return res.redirect('/error')

    }

})

module.exports = {
    getLoginUser,
    getSignupUser,
    getforgotPassword,
    getHomePage,
    getEnterOtp,
    getRestPassword,
    getLogout,
    getProfilePage,
    getAddressPage,
    getShopPage,
    getCartPage,
    getWishList,
    getproductPage,
    getCheckoutPage,
    getCheckoutPageByProduct,
    getOrderSummaryPage,
    errorPage,
    getUserOrdersPage,
    getContactPage,
    getAboutPage,
}