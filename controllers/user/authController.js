const userModel = require('../../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const signupUser = async (req, res) => {
   const { username, email, password, confirmPassword } = req.body
   console.log('Req.body = ', req.body);
   if (password !== confirmPassword) {
      return res.render('user/signup')
   }

   try {
      const existingUser = await userModel.findOne({ email })
      if (existingUser) {
         return res.render('user/signup')
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
      return res.render('user/signup')

   }
}

const loginUser = async (req, res) => {

   const { email, password } = req.body

   try {

      const User = await userModel.findOne({ email })
      if (!User) return res.render('user/login', { success: null, error: 'User not exits' })

      const isMatch = await bcrypt.compare(password, User.password)

      if (!isMatch) return res.render('user/login', { success: null, error: 'Password is incorrect' })


      const token = jwt.sign({
         id: signupUser.id
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

module.exports = {
   signupUser,
   loginUser,
   getLoginUser,
   getSignupUser,
   getHomePage,
}