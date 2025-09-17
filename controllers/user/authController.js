const userModel = require('../../models/user')
const bcrypt = require('bcrypt')


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

   const signupUserUser = userModel.find({ email })
   if (!signupUserUser) return res.render('user/login', { success: null, error: null })
      


}

module.exports = { signupUser }