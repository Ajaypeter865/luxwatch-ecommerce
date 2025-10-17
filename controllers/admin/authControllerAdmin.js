// IMPORT DEPENDENCY
const asyncHandler = require('express-async-handler')

// IMPORT MODULES
const adminModel = require('../../models/admin')


const loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    console.log('loginAdmin - req.body =', req.body);

    const admin = await adminModel.findOne({ email })
    console.log('loginAdmin - admin =', admin);

    if (!admin) {
        console.log('loginAdmin - Enter admin 1');

        return res.render('admin/adminLogin', {
            error: 'User dont exists',
        })
    }

    if (admin.password !== password) {

           return res.render('admin/adminLogin', {
            error: 'Password is incorrect',
        })
    }

    return res.redirect('/admin')

})


module.exports = {
    loginAdmin,
}