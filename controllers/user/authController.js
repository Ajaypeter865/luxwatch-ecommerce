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

      return res.send('Hi from login')


   } catch (error) {
      console.error('Error from signupUser', error.message, error.stack);
      return res.render('user/signup')

   }

}

module.exports = { signupUser }