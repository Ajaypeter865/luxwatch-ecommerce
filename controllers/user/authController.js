
// IMPORT MODULES
const userModel = require('../../models/user')
const addressModel = require('../../models/addresses')
const cartModel = require('../../models/cart')

// IMPORT DEPENDENCY
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const { errorMonitor } = require('nodemailer/lib/xoauth2')
const asyncHandler = require('express-async-handler')
const productModel = require('../../models/products')
require('dotenv').config()


// -------------------------------------------------------FUNCTIONS
// ---------------------------------------------------REGISTER FUNCTIONS
const signupUser = async (req, res) => {
   const { username, email, phone, password, confirmPassword } = req.body
   if (password !== confirmPassword) {
      return res.render('user/signup', { success: null, error: 'Password does not match' })
   }

   try {
      const existingUser = await userModel.findOne({ email })
      if (existingUser) {
         return res.render('user/signup', { error: 'User already exists', success: null })
      }

      const hashedPassword = await bcrypt.hash(password, 10)


      await userModel.create({
         name: username,
         email,
         phone,
         password: hashedPassword,
         role: null,

      })
      return res.render('user/login', { success: null, error: null })
   } catch (error) {
      console.error('Error from signupUser', error.message, error.stack);
      return res.render('user/signup', { success: null, error: 'Server error' })

   }
}



const loginUser = async (req, res) => {

   const { identifier, password } = req.body  //IDENTIFIER IS FOR EMAIL OR PASSWORD


   try {
      const userEmail = await userModel.findOne({ email: req.body.identifier })

      const userPhone = await userModel.findOne({ phone: req.body.identifier })

      const User = userEmail || userPhone


      if (!User) return res.render('user/login', { success: null, error: 'User not exists' })

      if (User.status === "Blocked") {
         console.log('loginUser - Blocked');

         return res.render('user/login', { error: 'You are blocked by admin' })
      }


      const isMatch = await bcrypt.compare(password, User.password)



      if (!isMatch) return res.render('user/login', { success: null, error: 'Password is incorrect' })


      const token = jwt.sign({
         id: User._id,
         name: User.name,
         email: User.email,
         googleId: User.googleId,
         phone: User.phone

      }, process.env.secretKey,
         { expiresIn: '7d' })

      res.cookie('userToken', token, {
         httponly: true,
         secure: process.env.NODE_ENV = 'production',
         sameSite: 'strict',
         maxage: 7 * 24 * 60 * 60 * 10000
      })

      return res.redirect('/')

   } catch (error) {
      console.log('Error from loginuser', error.message, error.stack);
      return res.render('user/login', { success: null, error: 'Something went wrong' })
   }

}



const forgotPassword = async (req, res) => {
   const { email } = req.body
   try {
      const user = await userModel.findOne({ email })
      if (!user) return res.render('user/forgotPassword', { message: 'User does not exits' })

      const otp = Math.floor(100000 + Math.random() * 90000)
      console.log('OTP =', otp);
      const otpExpires = new Date(Date.now() + 5 * 60 * 1000)

      user.resetOtp = otp,
         user.otpExpires = otpExpires
      await user.save()

      const transporter = nodemailer.createTransport({
         host: process.env.EMAIL_HOST,
         port: process.env.EMAIL_PORT,
         secure: true,
         auth: {
            user: process.env.emailUser,
            pass: process.env.emailPassword,
         }

      })

      await transporter.sendMail({
         from: `"My app" <${process.env.emailUser}>`,
         to: email,
         subject: 'This otp of restpassword',
         html: ` <p>Your otp is <b>${otp}</b>.it experies in 5mins </p>`,

      })

      return res.render('user/enterOtp', { message: 'Your otp send successfully', email })

   } catch (error) {
      console.log('Error from forgotPassword', error.message, error.stack);
      res.render('user/forgotPassword', { success: null, error: 'Something went wrong ' })
   }
}



const verifyOtp = async (req, res) => {
   const { otp, email } = req.body

   try {
      const user = await userModel.findOne({ email })
      const otpJoin = otp.join('')


      if (!user || Number(otpJoin) !== user.resetOtp || user.otpExpires < Date.now()) {

         return res.render('user/forgotPassword', { error: 'Invalid otp or email', email })
      }


      return res.render('user/restPassword', { userId: user.id, email })

   } catch (error) {
      console.log('Error from verifyOtp', error.message, error.stack);
      return res.render('user/forgotPassword', { email })

   }
}



const restPassword = async (req, res) => {
   const { id, email, password, confirmPassword } = req.body
   try {
      if (password !== confirmPassword) {

         return res.render('user/restPassword', { error: 'Password is not matching ', email, userId: id })
      }
      const hashedPassword = await bcrypt.hash(password, 10)

      const user = await userModel.findByIdAndUpdate(id, { password: hashedPassword }, { new: true })
      console.log('Func from restPassword - user =', user.email);



      res.render('user/login', { success: 'Password changed successfully' })
   } catch (error) {
      console.log('Error from restPassword', error.message, error.stack);
      res.render('user/resetPasswod', { userId: id, email })
   }

}


//------------------------------------------------------- PROFILE FUNCTIONS


const editProfile = async (req, res) => {
   const { id, email, phone, name } = req.body

   try {

      const existingUser = await userModel.findOne({
         $or: [{ email }, { phone }]
      })
      // console.log('editProfile - existingUser =', existingUser);

      if (existingUser && existingUser.id.toString() !== id) {
         return res.render('user/profile',
            {
               user: await userModel.findById(id),

               error: 'User with this email or phone already exists'
            }
         )
      }

      const updateUser = await userModel.findByIdAndUpdate(id, {
         email,
         name,
         phone
      }, { new: true, runValidators: true })

      console.log('editProfile - updateUser =', updateUser);

      if (!updateUser) {
         return res.render('user/profile', {
            user: await userModel.findById(id),
            error: 'Profile updation failed'
         })
      }

      return res.render('user/profile', {          // NEED TO CHANGE USER/PROFILE FOR IF THE CHANGE IS ADDING FROM ANYOTHER BUTTON FROM SIDEBAR
         user: updateUser,
         success: 'Profile updated successfully'
      })
   } catch (error) {
      console.log('Error in editProfile', error.message, error.stack);
      return res.render('user/profile', {
         user: await userModel.findById(id),
         error: 'Server error'
      })

   }
}



const addAddress = async (req, res) => {
   const { label, name, phone, pincode, addressLine, city, state } = req.body
   try {
      const userId = req.auth?.id || req.user?.id
      // console.log('addAdress - userId =', userId);
      if (!userId) {
         return res.render('user/address', { addresses: null, error: 'No user found', user: req.auth || req.user })
      }

      await addressModel.create({
         user: userId,
         label,
         name,
         phone,
         addressLine,
         state,
         city,
         pincode
      })
      console.log('addAddress - address created');

      const userAddress = await addressModel.find({ user: userId })
      req.flash('success', 'Address added successfully')
      return res.redirect('/address')


   } catch (error) {
      console.log('Error from addAddress', error.message, error.stack);
      // return res.send('Error from add address')
      return res.render('user/address', {
         addresses: null,
         user: req.auth || req.user,
         success: 'Cant Add Address',
      })

   }

}


const setDefaultAddress = async (req, res) => {
   const userId = req.auth?.id || req.user?.id
   try {
      const selectedAddress = await addressModel.findById(req.params.id)

      await addressModel.updateMany({ user: userId, isDefault: true }, { $set: { isDefault: false } })


      selectedAddress.isDefault = true
      await selectedAddress.save()

      const userAddress = await addressModel.find({ user: userId })
      // console.log('setDefaultAddress - userAddrress = ', userAddress);

      return res.render('user/address', {
         addresses: userAddress,
         user: req.auth || req.user,
      })
   } catch (error) {
      console.log('Error from setDefaultAddress', error.message, error.stack);
      return res.render('user/address', {
         addresses: null,
         user: req.auth || req.user,
         success: 'Address added successfully',
      })
   }
}


// const editAddress = asyncHandler(async (req, res) => {
//    const { addressId, label, name, phone, pincode, addressLine, city, state } = req.body;

//    const userId = req.auth?.id || req.user?.id;

//    // 1️⃣ Make sure the address belongs to this user
//    const address = await addressModel.findOne({ _id: addressId, user: userId });
//    if (!address) {
//       return res.render('user/address', {
//          addresses: null,
//          user: req.auth || req.user,
//          error: 'Address not found or not yours',
//       });
//    }

//    // 2️⃣ Update fields safely
//    address.label = label;
//    address.name = name;
//    address.phone = phone;
//    address.pincode = pincode;
//    address.addressLine = addressLine;
//    address.city = city;
//    address.state = state;

//    await address.save();

//    // 3️⃣ Fetch updated list of addresses to show on UI
//    const addresses = await addressModel.find({ user: userId });

//    // 4️⃣ Render the page with updated data
//    return res.render('user/address', {
//       addresses,
//       user: req.auth || req.user,
//       success: 'Address updated successfully!',
//    });
// });


const deleteAddress = asyncHandler(async (req, res) => {
   const userId = req.auth?.id || req.user?.id

   const selectedAddress = await addressModel.findById(req.params.id)
   console.log('deleteAddress - selectedAddress = ', selectedAddress);
   await addressModel.findByIdAndDelete(selectedAddress)

   const updateAddress = await addressModel.find({ user: userId })
   return res.render('user/address', {
      addresses: updateAddress,
      user: req.auth || req.user,
      success: 'Address deleted successfully',
   })

})



//------------------------------------------------------- CART FUNCTIONS

const addToCart = async (req, res) => {

   const userId = req.auth?.id || req.user?.id

   const productId = req.params.id
   try {
      const product = await productModel.findOne({ _id: productId })
      if (!product) {
         req.flash('error', 'No product found')
         return res.redirect('/shop')
      }


      let cart = await cartModel.findOne({ user: userId })
      if (!cart) {
         cart = new cartModel({
            product: [],
            user: userId,
            subTotal: 0,
            shipping: 0,
            grandTotal: 0
         })
      }

      const existingProductIndex = cart.products.findIndex(item => item.product.equals(productId))

      if (existingProductIndex > -1) {
         const productInCart = cart.products[existingProductIndex]
         productInCart.quantity += 1,

            productInCart.totalPrice = productInCart.quantity * productInCart.price
         req.flash('success', 'Product Incrimented')

         // return res.redirect('/shop')

      } else {
         cart.products.push({
            product: productId,
            price: product.price,
            quantity: 1,
            totalPrice: product.price,

         })
         req.flash('success', 'Product Added Successfully')
      }

      cart.subTotal = cart.products.reduce((sum, item) => {
         return sum + item.totalPrice;
      }, 0)

      cart.shipping = 10,

         cart.grandTotal = cart.subTotal + cart.shipping

      await cart.save()
      return res.redirect('/shop')


   } catch (error) {
      console.log('Error from addToCart', error.message, error.stack);
      req.flash('error', 'Server error')
      return res.redirect('/shop')

   }

}

const updateCart = asyncHandler(async (req, res) => {
  const { quantities } = req.body; // e.g. { "6789abc": "2", "6789def": "3" }

  for (const [productId, qty] of Object.entries(quantities)) {
    await cartModel.updateOne(
      { "items.product": productId },
      { $set: { "items.$.quantity": parseInt(qty) } }
    );
  }

  req.flash("success", "Cart updated successfully!");
  res.redirect("/cart");
   
})

const deleteCartProducts = async (req, res) => {

   try {
      const userId = req.auth?.id || req.user?.id

      const productId = req.params.id

      const cart = await cartModel.findOne({ user: userId })
      console.log('deleteCartProducts - cart 1 =', cart);


      const updatedProducts = cart.products.filter(item => {
         return item.product._id.toString() !== productId
      })

      console.log('deleteCartProducts - cartItems =', updatedProducts);

      await cartModel.updateOne({ user: userId },
         {
            $set: {
               products: updatedProducts
            }
         }
      )

      const updatedCart = await cartModel.findOne({ user: userId })

      updatedCart.subTotal = updatedCart.products.reduce((sum, item) => {
         return sum + item.totalPrice
      }, 0)
      updatedCart.shipping = 10,

         updatedCart.grandTotal = updatedCart.subTotal + updatedCart.shipping

         await updatedCart.save()

      req.flash('error', 'Item deleted')
      return res.redirect('/cart')

   } catch (error) {
      console.log('Error from deleteCartProducts', error.message, error.stack);
      return res.redirect('/cart')

   }
}




//------------------------------------------------------- LOGOUT FUNCTIONS

const logoutUser = async (req, res) => {
   res.clearCookie('userToken')
   res.render('user/login')

}


module.exports = {
   signupUser,
   loginUser,
   forgotPassword,
   verifyOtp,
   restPassword,
   editProfile,
   logoutUser,
   addAddress,
   setDefaultAddress,
   // editAddress,
   deleteAddress,
   addToCart,
   deleteCartProducts,
   updateCart,

}