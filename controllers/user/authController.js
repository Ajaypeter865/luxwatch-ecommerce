
// IMPORT MODULES
const userModel = require('../../models/user')
const addressModel = require('../../models/addresses')
const cartModel = require('../../models/cart')

const utils = require('../../utils/helpers')

// IMPORT DEPENDENCY
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const { errorMonitor } = require('nodemailer/lib/xoauth2')
const asyncHandler = require('express-async-handler')
const productModel = require('../../models/products')
const wishlistModel = require('../../models/wishlist')
const orderModel = require('../../models/order')
const couponModel = require('../../models/coupon')
const enquiryModel = require('../../models/enquiry')
// const { name } = require('ejs')
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


//------------------------------------------------------- ORDER FUNCTIONS


const cancelOrder = asyncHandler(async (req, res) => {

   try {
      const { orderId, reason, customReason } = req.body
      console.log('cancelOrder - req.body =', req.body);

      const cancelOrder = await orderModel.findByIdAndUpdate(orderId,
         { $set: { cancel: true, cancelReason: reason || customReason } },
         { new: true, runValidators: true }
      )

      console.log('cancelOrder =', cancelOrder);
      req.flash('success', 'Order cancel request was submitted')
      return res.redirect('/profile')

      // res.send('Hi')

   } catch (error) {
      console.log('Error from cancelOrder =', error.message, error.stack);

      return res.redirect('/error?cancelorder')


   }

})



//------------------------------------------------------- CART FUNCTIONS

// const addToCart = async (req, res) => {

//    const userId = req.auth?.id || req.user?.id

//    const productId = req.params.id
//    try {
//       const product = await productModel.findOne({ _id: productId })
//       if (!product) {
//          req.flash('error', 'No product found')
//          return res.redirect('/shop')
//       }


//       let cart = await cartModel.findOne({ user: userId })
//       if (!cart) {
//          cart = new cartModel({
//             product: [],
//             user: userId,
//             subTotal: 0,
//             shipping: 0,
//             grandTotal: 0
//          })
//       }

//       const existingProductIndex = cart.products.findIndex(item => item.product.equals(productId))

//       if (existingProductIndex > -1) {
//          const productInCart = cart.products[existingProductIndex]
//          productInCart.quantity += 1,

//             productInCart.totalPrice = productInCart.quantity * productInCart.price
//          req.flash('success', 'Product Incrimented')

//          // return res.redirect('/shop')

//       } else {
//          cart.products.push({
//             product: productId,
//             price: product.price,
//             quantity: 1,
//             totalPrice: product.price,

//          })
//          req.flash('success', 'Product Added Successfully')
//       }

//       cart.subTotal = cart.products.reduce((sum, item) => {
//          return sum + item.totalPrice;
//       }, 0)

//       cart.shipping = 10,

//          cart.grandTotal = cart.subTotal + cart.shipping

//       await cart.save()
//       return res.redirect('/shop')


//    } catch (error) {
//       console.log('Error from addToCart', error.message, error.stack);
//       req.flash('error', 'Server error')
//       return res.redirect('/shop')

//    }

// }

const addToCartAjax = async (req, res) => {
   const userId = req.auth?.id || req.user?.id;
   const productId = req.params.id;

   try {
      const product = await productModel.findById(productId);
      if (!product) {
         return res.status(404).json({ success: false, message: 'Product not found' });
      }

      let cart = await cartModel.findOne({ user: userId });
      if (!cart) {
         cart = new cartModel({
            products: [],
            user: userId,
            subTotal: 0,
            shipping: 0,
            grandTotal: 0
         });
      }

      const existingProductIndex = cart.products.findIndex(
         item => item.product.equals(productId)
      );

      let message = '';

      if (existingProductIndex > -1) {
         const productInCart = cart.products[existingProductIndex];
         productInCart.quantity += 1;
         productInCart.totalPrice = productInCart.quantity * productInCart.price;
         message = 'Quantity increased in cart';
      } else {
         cart.products.push({
            product: productId,
            price: product.price,
            quantity: 1,
            totalPrice: product.price
         });
         message = 'Product added to cart';
      }

      cart.subTotal = cart.products.reduce((sum, item) => sum + item.totalPrice, 0);
      cart.shipping = 10;
      cart.grandTotal = cart.subTotal + cart.shipping;

      await cart.save();

      // Return updated cart count or summary
      const totalItems = cart.products.reduce((sum, item) => sum + item.quantity, 0);

      return res.json({
         success: true,
         message,
         totalItems,
         subTotal: cart.subTotal,
         grandTotal: cart.grandTotal
      });
   } catch (error) {
      console.error('Error in addToCartAjax:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
   }
};

// GEMINI
// const updateCart = asyncHandler(async (req, res) => {
//    // Assuming you have middleware to get userId (e.g., req.user.id or req.auth.id)
//    const userId = req.user?.id || req.auth?.id;
//    // req.body.quantities is an object: { productId_1: quantity_1, productId_2: quantity_2, ... }
//    const { quantities } = req.body;

//    if (!userId || !quantities) {
//       req.flash("error", "Invalid request data.");
//       return res.redirect("/cart");
//    }

//    try {
//       // 1. Fetch the user's cart
//       const cart = await cartModel.findOne({ user: userId });

//       if (!cart) {
//          req.flash("error", "Cart not found.");
//          return res.redirect("/cart");
//       }

//       // 2. Iterate through the submitted quantities and update the cart object in memory
//       for (const [productId, qtyString] of Object.entries(quantities)) {
//          const newQuantity = parseInt(qtyString);

//          // Find the index of the product in the cart's array
//          const productIndex = cart.products.findIndex(
//             // Use .toString() to safely compare the ObjectId with the string ID from the form
//             item => item.product.toString() === productId
//          );

//          if (productIndex > -1) {
//             const item = cart.products[productIndex];

//             // Ensure quantity is positive
//             if (newQuantity > 0) {
//                item.quantity = newQuantity;
//                // Recalculate the line item's totalPrice immediately
//                item.totalPrice = item.quantity * item.price;
//             } else {
//                // OPTIONAL: If the quantity is zero or less, you may want to remove the item
//                // For now, we will just set it to 1 to prevent issues, or you can use filter later.
//                item.quantity = 1;
//             }
//          }
//       }

//       // 3. Recalculate the entire cart's totals

//       // Calculate new subTotal (sum of all line item totalPrices)
//       cart.subTotal = cart.products.reduce((sum, item) => {
//          return sum + item.totalPrice;
//       }, 0);

//       // Calculate grandTotal
//       // Assuming shipping is a fixed value you manage elsewhere (e.g., cart.shipping = 10)
//       cart.shipping = 10;
//       cart.grandTotal = cart.subTotal + cart.shipping;

//       // 4. Save the fully updated cart object back to the database
//       await cart.save();

//       req.flash("success", "Cart updated successfully!");
//       return res.redirect("/cart");

//    } catch (error) {
//       console.error("Error updating cart:", error.message);
//       req.flash("error", "Failed to update cart. Please try again.");
//       return res.redirect("/cart");
//    }
// });

const updateCart = asyncHandler(async (req, res) => {
  const userId = req.user?.id || req.auth?.id;
  const { quantities } = req.body;

  if (!userId || !quantities) {
    return res.json({ success: false, message: "Invalid request" });
  }

  try {
    const cart = await cartModel.findOne({ user: userId });
    if (!cart) return res.json({ success: false, message: "Cart not found" });

    // Update quantities
    for (const [productId, qtyString] of Object.entries(quantities)) {
      const newQty = parseInt(qtyString);

      const index = cart.products.findIndex(
        item => item.product.toString() === productId
      );

      if (index > -1) {
        cart.products[index].quantity = newQty;
        cart.products[index].totalPrice =
          cart.products[index].price * newQty;
      }
    }

    // Recalculate totals
    await utils.recalcCartTotals(cart);
    await cart.save();

    return res.json({ success: true });

  } catch (err) {
    console.log("Update Cart Error:", err.message);
    return res.json({ success: false, message: "Server error" });
  }
});


// const updateCart = async (req, res) => {

//    const userId = req.user?.id || req.auth?.id

//    const { quantities } = req.body
//    console.log('updateCart - req.body =', req.body);

//    const cart = await cartModel.findOne({ user: userId })

//    // req.body.forEach(updateItem => {
//    //    const index = cart.products.findIndex(p => p.quantities.toString() === updateItem._id)

//    //    if(index > -1)

//    // });

//    return res.send('Hi')


// }


// const deleteCartProducts = async (req, res) => {

//    try {
//       const userId = req.auth?.id || req.user?.id

//       const productId = req.params.id

//       const cart = await cartModel.findOne({ user: userId })
//       // console.log('deleteCartProducts - cart 1 =', cart);


//       const updatedProducts = cart.products.filter(item => {
//          return item.product._id.toString() !== productId
//       })

//       console.log('deleteCartProducts - updatedProducts =', updatedProducts);

//       await cartModel.updateOne({ user: userId },
//          {
//             $set: {
//                products: updatedProducts
//             }
//          }
//       )

//       const updatedCart = await cartModel.findOne({ user: userId })

//       updatedCart.subTotal = updatedCart.products.reduce((sum, item) => {
//          return sum + item.totalPrice
//       }, 0)
//       updatedCart.shipping = 10,

//          updatedCart.grandTotal = updatedCart.subTotal + updatedCart.shipping

//       await updatedCart.save()

//       req.flash('error', 'Item deleted') // THIS MESSAGE IS NOT RENDERING DONT KNOW WHY
//       return res.redirect('/cart')

//    } catch (error) {
//       console.log('Error from deleteCartProducts', error.message, error.stack);
//       return res.redirect('/cart')

//    }
// }


const deleteCartProducts = async (req, res) => {
  try {
    const userId = req.auth?.id || req.user?.id;
    const productId = req.params.id;

    const cart = await cartModel.findOne({ user: userId });
    if (!cart) return res.json({ success: false, message: "Cart not found" });

    cart.products = cart.products.filter(
      item => item.product.toString() !== productId
    );

    await utils.recalcCartTotals(cart);
    await cart.save();

    return res.json({ success: true });

  } catch (error) {
    console.log("Delete Cart Error:", error.message);
    return res.json({ success: false, message: "Server error" });
  }
};


//------------------------------------------------------- WISHLIST FUNCTIONS

// const addToWishlist = async (req, res) => {

//    try {
//       const userId = req.auth?.id || req.user?.id

//       const productId = req.params.id

//       // const product = await productModel.findOne({ _id: productId })
//       // console.log('addProductsToWishlist - product =', product);

//       let wishlist = await wishlistModel.findOne({ user: userId })


//       if (!wishlist) {
//          wishlist = new wishlistModel({
//             user: userId,
//             products: [],
//          })

//       }


//       const existingProductIndex = wishlist.products.findIndex(id => id.toString() === productId)
//       console.log('addProductsToWishlist - existingProductIndex =', existingProductIndex);

//       if (existingProductIndex > -1) {
//          const checkIsProductExist = wishlist.products[existingProductIndex]
//          req.flash('success', 'This Product Is Already In Wishlist')
//          // return res.redirect('/shop')

//       } else {
//          wishlist.products.push(productId)
//          console.log('addProductsToWishlist - else');

//          req.flash('success', 'Product Added To Wishlist')
//       }

//       await wishlist.save()



//       return res.redirect('/wishlist')
//    } catch (error) {
//       console.log('Error from addProductsToWishlist =', error.message, error.stack);
//       return res.status(500).redirect('/shop?Server error')

//    }

// }

const addToWishlistAjax = async (req, res) => {
   const userId = req.auth?.id || req.user?.id;
   const productId = req.params.id;

   try {
      let wishlist = await wishlistModel.findOne({ user: userId });

      if (!wishlist) {
         wishlist = new wishlistModel({ user: userId, products: [] });
      }

      const alreadyExists = wishlist.products.some(
         id => id.toString() === productId
      );

      if (alreadyExists) {
         return res.json({
            success: false,
            message: 'This product is already in your wishlist'
         });
      }

      wishlist.products.push(productId);
      await wishlist.save();

      return res.json({
         success: true,
         message: 'Product added to wishlist',
         totalItems: wishlist.products.length
      });
   } catch (error) {
      console.error('Error in addToWishlistAjax:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
   }
};


const removeFromWishlist = async (req, res) => {
   try {
      const userId = req.user?.id || req.auth?.id
      if (!userId) {
         req.flash('error', 'No user Found')
         return res.redirect('/login')

      }

      const productId = req.params.id
      console.log('removeFromWishlist - productId =', productId);
      if (!productId) {
         req.flash('error', 'No Product Exists')
      }


      const wishlistProducts = await wishlistModel.findOne({ user: userId })
      console.log('removeFromWishlist - products = ', wishlistProducts);

      const removeProduct = wishlistProducts.products.filter(item => { return item._id.toString() !== productId })

      console.log('removeFromWishlist - removeProduct = ', removeProduct);

      await wishlistModel.updateOne({ user: userId },
         {
            $set: {
               products: removeProduct
            }
         }
      )




      await wishlistProducts.save()
      return res.redirect('/wishlist')

   } catch (error) {
      console.log('Error from removeFromWishlist =', error.message, error.stack);
      return res.status(500).redirect('/wishlist?Server error')
   }

}

//------------------------------------------------------- CHECKOUT FUNCTIONS


// const proccedToPayement = asyncHandler(async (req, res) => {

//    try {
//       const userId = req.auth?.id || req.user?.id

//       const { address, paymentMethod, deliveryInstructions, name, email, phone, altPhone } = req.body
//       console.log('proccedToPayement - req.body =', req.body);

//       const orderDate = new Date().toLocaleDateString('en-us', {
//          year: 'numeric',
//          month: 'long',
//          day: 'numeric'
//       })
//       // console.log('proccedToPayment - orderDate =', orderDate);

//       const addressId = await addressModel.findById(address)
//       // console.log('proccedToPayment - addressId =', addressId);

//       const cart = await cartModel.findOne({ user: userId }).populate('products.product')


//       const orders = await orderModel.create({
//          user: userId,

//          shippingAddress: {
//             fullName: name,
//             email: email,
//             phone: phone,
//             addressLine: addressId.addressLine,
//             city: addressId.city,
//             state: addressId.state,
//             alternatePhone: altPhone,
//             label: addressId.label,
//             pincode: addressId.pincode
//          },

//          orderItems: cart.products.map(item => ({
//             productId: item.product.id,
//             name: item.product.name,
//             quantity: item.quantity,
//             price: item.price,
//             total: item.quantity * item.price,
//          })),

//          paymentMethord: paymentMethod,
//          orderStatus: 'Pending',
//          grandTotal: cart.grandTotal,
//          paymentStatus: 'Pending',
//          placedAt: orderDate,
//          deliveredAt: '',
//          deliveryInstruction: deliveryInstructions || '',
//          // cancel: '',


//       })
//       // console.log('proccedToPayment - orders =', orders);


//       if (paymentMethod === 'COD') {

//          return res.redirect(`/order/success/${orders.id}`)
//       } else {

//          return res.redirect(`/payment/${order.id}`)
//       }

//    } catch (error) {
//       console.log('Error in proccedPayment =', error.stack, error.message);
//       res.send('Error')

//    }
// })


// THIS FUNCITON  IS FOR PRODUCTDETAILS PAGE -> BUYNOW -> PROCCED TO CHEKCOUT ->
// const proccedPaymentByProduct = asyncHandler(async (req, res) => {
//    // console.log('From proccedPayment');


//    try {

//       const userId = req.auth?.id || req.user?.id

//       const productId = req.params.id

//       const { address, name, email, phone, altPhone, paymentMethod, deliveryInstructions } = req.body

//       const cart = await productModel.findById(productId)
//       const addressId = await addressModel.findById(address)
//       // console.log('proccedPaymentByProduct - cart =', cart);

//       const orderDate = new Date().toDateString('en-us', {
//          year: 'numeric',
//          month: 'long',
//          day: 'numeric'
//       })

//       const order = await orderModel.create({
//          user: userId,

//          shippingAddress: {
//             fullName: name,
//             email,
//             phone,
//             addressLine: addressId.addressLine,
//             state: addressId.state,
//             alternatePhone: altPhone,
//             label: addressId.label,
//             pincode: addressId.pincode
//          },

//          orderItems: {
//             productId,
//             name: productId.name,
//             quantity: 1,
//             price: productId.price,
//             total: productId.price + 10 //(SHIPPING AMOUNT WILL CHANGE)
//          },
//          deliveryInstruction: deliveryInstruction,
//          paymentMethod: paymentMethod,
//          paymentStatus: 'Pending',
//          orderStatus: 'Pending',
//          grandTotal: total,
//          deliveredAt: '',
//          placedAt: orderDate,
//       })

//       if (paymentMethod === 'COD') {
//          return res.redirect(`/order/success/${order.id}`)
//       } else {
//          return res.redirect(`/payment/${order.id}`)
//       }

//    } catch (error) {
//       console.log('Error in proccedPayment =', error.stack, error.message);
//       res.send('Error')
//    }

// })


// const postCheckoutByProduct = asyncHandler(async (req, res) => {
//   try {
//     const userId = req.auth?.id || req.user?.id;

//     // ✅ Extract data from the form submission
//     const { address, paymentMethod, deliveryInstructions, name, email, phone, altPhone } = req.body;
//     const productId = req.params._id; // product ID from URL

//     console.log('postCheckoutByProduct - req.params._id =', productId);
//     console.log('postCheckoutByProduct - req.body =', req.body);

//     // ✅ Fetch the selected product and address
//     const product = await productModel.findById(productId);
//     const selectedAddress = await addressModel.findOne({user : userId});

//     if (!product || !selectedAddress) {
//       req.flash('error', 'Invalid product or address');
//       return res.redirect(`/checkout/${productId}`);
//     }

//     // ✅ Create order date
//     const orderDate = new Date().toDateString('en-US', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     });

//     // ✅ Create the order
//     const order = await orderModel.create({
//       user: userId,

//       shippingAddress: {
//         fullName: name,
//         email,
//         phone,
//         addressLine: selectedAddress.addressLine,
//         city: selectedAddress.city,
//         state: selectedAddress.state,
//         alternatePhone: altPhone,
//         label: selectedAddress.label,
//         pincode: selectedAddress.pincode,
//       },

//       orderItems: [
//         {
//           productId,
//           name: product.name,
//           quantity: 1,
//           price: product.price,
//           total: product.price + 10, // Including flat shipping charge
//         },
//       ],

//       paymentMethod,
//       deliveryInstruction: deliveryInstructions || '',
//       paymentStatus: 'Pending',
//       orderStatus: 'Pending',
//       grandTotal: product.price + 10,
//       placedAt: orderDate,
//       deliveredAt: '',
//     });

//     // ✅ Redirect based on payment method
//     if (paymentMethod === 'COD') {
//       return res.redirect(`/order/success/${order.id}`);
//     } else {
//       return res.redirect(`/payment/${order.id}`);
//     }

//   } catch (error) {
//     console.log('Error in postCheckoutByProduct =', error.message, error.stack);
//     return res.status(500).send('Error creating order');
//   }
// });


const proccedToPayement = asyncHandler(async (req, res) => {

   const userId = req.auth?.id || req.user?.id

   //   console.log('proccedToPayement - URL:', req.originalUrl);
   //  console.log('proccedToPayement- Params:', req.params);

   const productId = req.params.id
   console.log('proccedToPayement - productId = ', productId);


   const { address, paymentMethod, deliveryInstructions, name, email, phone, altPhone } = req.body

   // console.log('proccedToPayement - req.body.deliveryInstructions =', deliveryInstructions);

   // console.log('proccedToPayement - req.body.address =', address);

   const orderDate = new Date().toDateString('en-us', {
      year: 'numeric',
      day: 'numeric',
      month: 'long',
   })

   const addressData = await addressModel.findById(address)


   let orderItems = []
   let grandTotal = 0

   if (!productId) {

      const cart = await cartModel.findOne({ user: userId }).populate('products.product')

      if (!cart || cart.products.length < 0) {
         req.flash('error', 'You have no products in the cart')
         return res.redirect('/shop')
      }

      orderItems = cart.products.map(item => ({
         productId: item.product.id,
         name: item.product.name,
         quantity: item.quantity,
         price: item.price,
         total: item.quantity * item.price,


      }))

      grandTotal = cart.grandTotal

   } else {

      const product = await productModel.findById(productId)
      if (!product) {
         req.flash('error', 'Product Not Found')
         return res.redirect('/shop')
      }

      orderItems = [
         {
            productId: productId,
            name: product.name,
            quantity: 1,
            price: Number(product.price),
            total: Number(product.price) + 10 // SHIPPING CHARGE


         }
      ]

      grandTotal = product.price + 10
   }


   const order = await orderModel.create({
      user: userId,
      shippingAddress: {
         fullName: name,
         phone: phone,
         addressLine: addressData.addressLine,
         city: addressData.city,
         state: addressData.state,
         pincode: addressData.state,
         alternatePhone: altPhone,
         email: email,
         label: addressData.label,
      },
      paymentMethod,
      paymentStatus: 'Pending',
      deliveryInstruction: deliveryInstructions,
      orderStatus: 'Pending',
      grandTotal,
      orderItems,
      placedAt: orderDate,
   })

   if (paymentMethod === 'COD') {
      await cartModel.findOneAndDelete({user : userId})
      return res.redirect(`/order/success/${order.id}`)
   } else {
      return res.redirect(`/order/payment/${order.id}`)
   }

})

//------------------------------------------------------- COUPON FUNCTIONS


// THIS IS THE APPLY COUPON FUNCTION BY ME
// const applyCoupon = asyncHandler(async (req, res) => {

//    try {

//       const userId = req.auth?.id || req.user?.id

//       const { couponCode } = req.body
//       // console.log('applyCoupon - couponCode =', couponCode);


//       const coupon = await couponModel
//          .findOne({ code: couponCode })
//          .populate('usedBy', '_id name email');
//       console.log('applyCoupon - coupon =', coupon);


//       if (!coupon || couponCode.toString() !== coupon.code) {
//          req.flash('error', 'No such coupon')
//          return res.redirect('/cart')
//       }

//       let cart = await cartModel.findOne({ user: userId })
//       // console.log('applyCoupon - cart =', cart);

//       let discount = coupon.discountValue
//       let afterDiscount = cart.grandTotal - discount
//       // console.log('applyCoupon - afterDiscount =', afterDiscount);

//       cart = await cartModel.findOneAndUpdate({ user: userId }, {
//          grandTotal: afterDiscount
//       }, { new: true })

//       await couponModel.findByIdAndUpdate(coupon.id, {
//          $push: { usedBy: userId }
//       })

//       return res.redirect('/cart')

//    } catch (error) {
//       console.log('Error from applyCoupon =', error.message, error.stack);
//       return res.redirect('/error')

//    }
// })

// THIS IS THE APPLY COUPOUN BY GPT 
const applyCoupon = asyncHandler(async (req, res) => {
   try {
      const userId = req.auth?.id || req.user?.id;
      const { couponCode } = req.body;
      if (!couponCode || typeof couponCode !== 'string') {
         req.flash('error', 'Invalid coupon code');
         return res.redirect('/cart');
      }

      const codeUpper = couponCode.trim().toUpperCase();

      const coupon = await couponModel.findOne({ code: codeUpper });
      if (!coupon) {
         req.flash('error', 'Coupon not found');
         return res.redirect('/cart');
      }

      // Basic validations
      if (!coupon.active) {
         req.flash('error', 'This coupon is not active');
         return res.redirect('/cart');
      }

      const now = new Date();
      if (coupon.expiryDate && coupon.expiryDate < now) {
         req.flash('error', 'Coupon expired');
         return res.redirect('/cart');
      }

      // Prevent reuse by same user
      if (coupon.usedBy && coupon.usedBy.some(u => u.toString() === userId.toString())) {
         req.flash('error', 'You have already used this coupon');
         return res.redirect('/cart');
      }

      // Load cart and recalc totals
      let cart = await cartModel.findOne({ user: userId });
      if (!cart) {
         req.flash('error', 'Cart not found');
         return res.redirect('/cart');
      }

      await utils.recalcCartTotals(cart);

      // Check minPurchase
      const subTotal = cart.subTotal || 0;
      if (coupon.minPurchase && subTotal < coupon.minPurchase) {
         req.flash('error', `Minimum purchase of ₹${coupon.minPurchase} required to use this coupon`);
         return res.redirect('/cart');
      }

      // Only one coupon per cart
      if (cart.appliedCoupon) {
         req.flash('error', 'A coupon is already applied to your cart');
         return res.redirect('/cart');
      }

      // compute discountAmount (in rupees)
      let discountAmount = 0;
      if (coupon.discountType === 'Percentage') {
         // coupon.discountValue is percentage (e.g., 10 for 10%)
         discountAmount = (subTotal * (Number(coupon.discountValue) / 100));
         console.log('applyCoupon - discountAmount if');
      } else { // Fixed
         discountAmount = Number(coupon.discountValue);
         console.log('applyCoupon - discountAmount else');
      }

      // Normalize to 2 decimal places
      discountAmount = Number(discountAmount.toFixed(2));
      console.log('applyCoupon - discountAmount =', discountAmount);

      if (discountAmount < 0) discountAmount = 0;

      // Save appliedCoupon into cart
      cart.appliedCoupon = {
         coupon: coupon._id,
         code: coupon.code,
         discountType: coupon.discountType,
         discountValue: coupon.discountValue,
         discountAmount
      };

      // recalc grand total
      cart = await utils.recalcCartTotals(cart);
      await cart.save();

      // Mark coupon as used by this user (so they can't use again)
      await couponModel.findByIdAndUpdate(coupon._id, {
         $addToSet: { usedBy: userId } // addToSet to avoid duplicates
      });

      req.flash('success', `Coupon ${coupon.code} applied. You saved ₹${discountAmount.toFixed(2)}`);
      return res.redirect('/cart');

   } catch (error) {
      console.error('applyCoupon error:', error);
      req.flash('error', 'Something went wrong while applying coupon');
      return res.redirect('/cart');
   }
});


// THIS IS THE REMOVE COUPON BY ME 

// const removeCoupon = asyncHandler(async (req, res) => {
//    try {

//       const userId = req.user?.id || req.auth?.id

//       let cart = await cartModel.findOne({ user: userId })

//       if (!cart) {
//          req.flash('error', 'No cart found')
//          return res.redirect('/cart')

//       }

//       if (!cart.coupons) {
//          req.flash('error', 'No coupon found')
//          return res.redirect('/cart')
//       }

//       cart.coupons = null

//       cart.save()

//       req.flash('success', 'Coupon removed')
//       return res.redirect('/cart')

//    } catch (error) {
//       console.log('Error from removeCoupon', error.message, error.stack);
//       return res.redirect('/error')
//    }
// })




//  THIS IS THE REMOVE COUPON BY GPT
const removeCoupon = asyncHandler(async (req, res) => {
   try {
      const userId = req.auth?.id || req.user?.id;
      let cart = await cartModel.findOne({ user: userId });
      if (!cart) {
         req.flash('error', 'Cart not found');
         return res.redirect('/cart');
      }

      if (!cart.appliedCoupon) {
         req.flash('error', 'No coupon applied');
         return res.redirect('/cart');
      }

      // Note: We keep coupon.usedBy entry as-is (so user cannot reuse)
      cart.appliedCoupon = null;

      await utils.recalcCartTotals(cart);
      await cart.save();

      req.flash('success', 'Coupon removed');
      return res.redirect('/cart');

   } catch (error) {
      console.error('removeCoupon error:', error);
      req.flash('error', 'Something went wrong while removing coupon');
      return res.redirect('/cart');
   }
});

//------------------------------------------------------- ENQUIRY FUNCTIONS

const postEnquiry = asyncHandler(async (req, res) => {
   try {

      const { message, name, email, subject } = req.body

      if (!message && !name && !email && !subject) {
         req.flash('Need to fill all the forms')
         return res.redirect('/contact')
      }
      await enquiryModel.create({
         name: name,
         email: email,
         subject: subject,
         message: message,
         status: 'Pending'
      })
      req.flash('success', 'Your enquiry send successfully, will Reply soon')
      return res.redirect('/contact')

   } catch (error) {
      console.log('Error from postEnquiry', error.message, error.stack);
      return res.redirect('/error')

   }
})




// ------------------------------------------------------ PAYMENT FUNCTIONS

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
   // addToCart,
   deleteCartProducts,
   updateCart,
   // addToWishlist,
   removeFromWishlist,
   addToWishlistAjax,
   addToCartAjax,
   proccedToPayement,
   cancelOrder,
   // proccedPaymentByProduct, // FOR PRODUCT DETAILS CHECKOUT
   // postCheckoutByProduct,
   applyCoupon,
   removeCoupon,
   postEnquiry,

}