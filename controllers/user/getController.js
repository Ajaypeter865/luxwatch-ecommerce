// IMPORT MODULES
const addressModel = require('../../models/addresses')
const userModel = require('../../models/user')
const productModel = require('../../models/products')
const asyncHandler = require('express-async-handler')
const cartModel = require('../../models/cart')
const wishlistModel = require('../../models/wishlist')

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
        return res.render('user/index', { success: null, error: null, products: null })

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


const getCartPage = asyncHandler(async (req, res) => {

    const userId = req.auth?.id || req.user?.id
    // console.log('getCartPage - userId =', userId);

    let cart = await cartModel.findOne({ user: userId }).populate('products.product', 'name image  price ')
    console.log('getCartPage - cart =', cart);

    if (!cart || !cart.products || cart.products.length === 0) {
        console.log('Enter if Block');

        return res.render('user/cart', {
            cartItems: [],
            totals: { subTotal: 0, shipping: 0, grandTotal: 0 }
        })
    }

    const cartItems = cart.products.map(item => ({
        _id: item.product._id,
        name: item.product.name,
        image: item.product.image,
        price: Number(item.product.price),
        quantity: item.quantity,
        total: item.product.price * item.quantity,
    }));

    console.log('getCartPage - cartItems =', cartItems);

    // console.log('getCartPage - cart 2 =',cartItems,  JSON.stringify(cartItems[0].products, null, 2))



    // const totals = await cartModel.findOne({ user: userId }).select('subTotal shipping grandTotal')

    cart.subTotal = cart.products.reduce((sum, item) => sum + item.subTotal, 0)
    cart.grandTotal = cart.products.reduce((sum, item) => sum + item.subTotal, 0) + cart.shipping
    console.log('getCartPage - cart.subTotal =', cart.subTotal);

    const totals = {
        shipping: cart.shipping,
        grandTotal: cart.grandTotal,
        subTotal: cart.subTotal,
    }

    console.log('getCartPage - totals =', totals);

    return res.render("user/cart", { cartItems, totals });

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

const getproductPage = async (req, res) => {
    try {
        const productId = req.params.id

        const product = await productModel.findOne({ _id: productId })
        // console.log('getProductPage - product =', product);


        return res.render('user/product', { product })
    } catch (error) {
        console.log('Error from getProductPage =', error.message, error.stack);
        return res.redirect(`/shop${error}`)
    }

}

// -----------------------------------------------------CHECKOUT FUNCTIONS

// const getCheckoutPage = asyncHandler(async (req, res) => {
//   try {
//     // Dummy user info
//     const user = {
//       name: "Abinav",
//       email: "abinav3420@gmail.com",
//       phone: "7902598742",
//     };

//     // Dummy saved addresses
//     const addresses = [
//       {
//         _id: "1",
//         label: "Home",
//         fullAddress: "Kizhakkayil House, Kannur, Kerala - 670741",
//       },
//       {
//         _id: "2",
//         label: "Office",
//         fullAddress: "TimeZone Building, MG Road, Kochi, Kerala - 682016",
//       },
//     ];

//     // Dummy cart items
//     const cartItems = [
//       {
//         _id: "101",
//         name: "Rolex Ocean",
//         quantity: 1,
//         price: 110,
//         total: 110,
//       },
//       {
//         _id: "102",
//         name: "Rolex Black",
//         quantity: 1,
//         price: 120,
//         total: 120,
//       },
//     ];

//     // Totals calculation
//     const subTotal = cartItems.reduce((acc, item) => acc + item.total, 0);
//     const shipping = 25;
//     const grandTotal = subTotal + shipping;

//     // ✅ Render Checkout Page
//     res.render("user/checkout", {
//       user,
//       addresses,
//       cartItems,
//       totals: { subTotal, shipping, grandTotal },
//       success: req.flash("success"),
//       error: req.flash("error"),
//     });
//   } catch (error) {
//     console.error("Error loading checkout page:", error);
//     req.flash("error", "Unable to load checkout page");
//     res.redirect("/cart");
//   }
// });

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

        console.log('getCheckOutPage - cartItems =', cartItems);
        const subTotal = cart.subTotal

        const shipping = cart.shipping

        const grandTotal = cart.grandTotal

        return res.render('user/checkout', { user, addresses, cartItems, totals: { subTotal, shipping, grandTotal } })

    } catch (error) {
        console.log('Error in getCheckoutPage =', error.stack, error.message);
        return res.send('error')
    }

})


const getCheckoutPageByProduct = asyncHandler(async (req, res) => {
    try {

        const userId = req.auth?.id || req.user?.id
        const user = await userModel.findOne({ _id: userId })

        const addresses = await addressModel.find({ user: userId }).select('label addressLine')
        // console.log('getCheckoutPageByProduct - address =', addresses);


        const productId = req.params.id

        const cart = await productModel.findOne({ _id: productId })
        console.log('getCheckoutPageByProduct - cart =', cart);

        const cartItems = [{
            name: cart.name,
            quantity: 1,
            total: cart.price,
        }]

        // shipping: 10

        console.log('getCheckoutPageByProduct - cartItems =', cartItems);

        const subTotal = cart.price

        const shipping = 10

        const grandTotal = Number(subTotal) + Number(shipping)


        return res.render('user/checkout', { user, addresses, cartItems, totals: { subTotal, shipping, grandTotal } })
     
    } catch (error) {
        console.log('Error from getCheckoutPageByProduct =', error.message, error.stack);
        return res.send('Error')


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
}