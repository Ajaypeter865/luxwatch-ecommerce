// IMPORT MODULES
const addressModel = require('../../models/addresses')
const userModel = require('../../models/user')
const productModel = require('../../models/products')
const asyncHandler = require('express-async-handler')

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


const getShopPage = asyncHandler(async (req, res) => {
    const products = await productModel.find()
    const categories = [1,2,3]
    return res.render('user/shop', { products, categories })
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
}