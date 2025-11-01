// IMPORT MIDDLEWARES
const express = require('express')
const router = express.Router()


// -----------------------------------------------------------CONTROLLERS
const { signupUser, loginUser, forgotPassword, verifyOtp, restPassword, editProfile,
    logoutUser, addAddress, setDefaultAddress, editAddress, deleteAddress, addToCart, deleteCartProducts } = require('../../controllers/user/authController')

//----------------------------------------------------------- MIDDLEWARES
const { signUpValidator, loginValidator } = require('../../middlewares/validation')
const { proctedAuth } = require('../../middlewares/auth')


router.post('/signup', signUpValidator, signupUser)
router.post('/login', loginValidator, loginUser)
router.post('/forgotpassword', forgotPassword)
router.post('/enterOtp', verifyOtp)
router.post('/resetpassword', restPassword)
router.post('/editProfile', editProfile)
router.post('/logout', logoutUser)


// ---------------------------------------------------------PROFILE FUCNTION

router.post('/address/add', proctedAuth, addAddress)
router.post('/address/set-default/:id', proctedAuth, setDefaultAddress)
router.post('/address/delete/:id', proctedAuth, deleteAddress)
// router.post('/address/edit', proctedAuth, editAddress)


//----------------------------------------------------- ADD TO CART FUCNTION

router.post('/shop/addtocart/:id', proctedAuth, addToCart)
router.post('/cart/delete/:id', proctedAuth, deleteCartProducts)


module.exports = router