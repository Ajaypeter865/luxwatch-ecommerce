
const userModel = require('../../models/user')



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

        return res.render('user/index', {
            products: null,
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

const getAddress = async (req, res) => {
    console.log('getAddress hits');

    return res.render('user/address', { addresses: null })

}

module.exports = {
    getLoginUser,
    getSignupUser,
    getforgotPassword,
    getHomePage,
    getEnterOtp,
    getRestPassword,
    getLogout,
    getAddress,
}