// IMPORT DEPENDENCY
const asyncHandler = require('express-async-handler')
const jwt = require('jsonwebtoken')

// IMPORT MODULES
const adminModel = require('../../models/admin')
const productModel = require('../../models/products')



// FUCTIONS
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

    const token = jwt.sign({
        id: admin.id,
        email: admin.email,
    }, process.env.secretKey,
        { expiresIn: "7d" })

    res.cookie('adminToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV = 'production',
        sameSite: 'strict',
        maxage: 7 * 24 * 60 * 60 * 10000
    })
    return res.redirect('/admin')
})

const addProducts = asyncHandler(async (req, res) => {
    const { name, category, brand, price, stock, status} = req.body
    
    console.log('addProducts - req.body =', req.body);
    console.log('addProducts - req.file', req.file);
    const imagePath = req.file.filename ? `/img/uploads/${req.file.filename}` : null
    // console.log('addProducts - imagePath =', imagePath);
    

    await productModel.create({
        name: name,
        category,
        brand,
        price,
        stock,
        image : imagePath,
        status,

    })
    console.log('addProducts - products created');
    const products = await productModel.find().sort({ createdAt: -1 })
    res.render('admin/products', { products })
})

module.exports = {
    loginAdmin,
    addProducts

}