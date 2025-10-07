
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
    res.render('user/enterOtp', { message: null, email })
}

module.exports = {
    getLoginUser,
    getSignupUser,
    getforgotPassword,
    getHomePage,
    getEnterOtp

}