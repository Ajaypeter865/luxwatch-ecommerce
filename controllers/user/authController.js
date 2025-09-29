const userModel = require('../../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()

// const deserializeUser = require('../../config/passport')   //REQ.USER CHECKING

const signupUser = async (req, res) => {
   const { username, email, password, confirmPassword } = req.body
   console.log('Req.body = ', req.body);
   if (password !== confirmPassword) {
      return res.render('user/signup')
   }

   try {
      const existingUser = await userModel.findOne({ email })
      if (existingUser) {
         return res.render('user/signup', { success: null, error: 'User already exists' })
      }

      const hashedPassword = await bcrypt.hash(password, 10)


      await userModel.create({
         name: username,
         email,
         password: hashedPassword,
         role: null,

      })
      return res.render('user/login', { success: null, error: null })
   } catch (error) {
      console.error('Error from signupUser', error.message, error.stack);
      return res.render('user/signup', { success: null, error: null })

   }
}

const loginUser = async (req, res) => {

   const { email, password } = req.body


   try {

      const User = await userModel.findOne({ email })
      if (!User) return res.render('user/login', { success: null, error: 'User not exists' })


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


// GET CONTROLLERS

const getLoginUser = async (req, res) => {
   return res.render('user/login', {
      success: null, error: null
   })
}

const getSignupUser = async (req, res) => {
   return res.render('user/signup', { success: null, error: null })
}

const getHomePage = async (req, res) => {
   return res.render('user/index', { products: null, success: null, error: null })

}


//                                            DEBUGGING REQ.USER 
const profilePage = async (req, res) => {
   try {
      // console.log(req.auth);
      
      console.log(`reqest from profile ${req.user} = user .!!,${req.auth} = auth`);
      if (req.user || req.auth ) {
         // return res.render('user/profile', { success: null, error: 'error' , products: null})
         return res.render('user/profile', { orders: null, user: req.auth || req.user })


      } else {
         return res.render('user/profile', { success: null, error: 'error' , products: null})
         // return res.render('user/index', { orders: null, user:  req.user })
      }
   } catch (error) {
      console.log('Error from profilePage = ', error.stack, error.message);
      return res.render('user/index', { success: null, error: null })

   }
}

module.exports = {
   signupUser,
   loginUser,
   getLoginUser,
   getSignupUser,
   getHomePage,
   profilePage,
}