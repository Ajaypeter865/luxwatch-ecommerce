const userModel = require('../../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const { errorMonitor } = require('nodemailer/lib/xoauth2')
require('dotenv').config()


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
      return res.render('user/signup', { success: null, error: null })

   }
}

const loginUser = async (req, res) => {

   const { identifier, password } = req.body  //IDENTIFIER IS FOR EMAIL OR PASSWORD


   try {
      const userEmail = await userModel.findOne({ email: req.body.identifier })

      const userPhone = await userModel.findOne({ phone: req.body.identifier })

      const User = userEmail || userPhone


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

const profilePage = async (req, res) => {
   try {

      // console.log(`Fucntion from profilePage : ${req.user} = user .!!,${req.auth} = auth`);
      if (req.user || req.auth) {
         // return res.render('user/profile', { success: null, error: 'error' , products: null})

         return res.render('user/profile', { orders: null, user: req.auth || req.user || null })


      } else {
         return res.render('user/profile', { success: null, error: 'No user found', products: null })
         // return res.render('user/index', { orders: null, user:  req.user })
      }
   } catch (error) {
      console.log('Error from profilePage = ', error.stack, error.message);
      return res.render('user/index', { success: null, error: null })

   }
}



const editProfile = async (req, res) => {
   const { id, email, phone, name } = req.body

   try {

      const existingUser = await userModel.findOne({
         $or: [{ email }, { phone }]
      })
      console.log('editProfile - existingUser =', existingUser );

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


      if (!updateUser) {
         return res.render('user/profile', {
            user: await userModel.findById(id),
            error: 'Profile updation failed'
         })
      }

      return res.render('user/profile', {
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


module.exports = {
   signupUser,
   loginUser,
   profilePage,
   forgotPassword,
   verifyOtp,
   restPassword,
   editProfile,
}