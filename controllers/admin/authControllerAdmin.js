// IMPORT DEPENDENCY
const asyncHandler = require('express-async-handler')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')

// IMPORT MODULES
const adminModel = require('../../models/admin')
const productModel = require('../../models/products')
const addressesModel = require('../../models/addresses')
const { emitWarning } = require('process')
const userModel = require('../../models/user')
const orderModel = require('../../models/order')




// -----------------------------------------------------------FUCTIONS

//------------------------------------------------------- LOGIN CONTROLLER
const loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    // console.log('loginAdmin - req.body =', req.body);

    const admin = await adminModel.findOne({ email })
    // console.log('loginAdmin - admin =', admin);

    if (!admin) {
        // console.log('loginAdmin - Enter admin 1');

        return res.render('admin/adminLogin', {
            error: 'User dont exists',
        })
    }

    if (admin.password !== password) {

        // return res.render('admin/adminLogin', {
        //     error: 'Password is incorrect',
        // })
        req.flash('error', 'Password is incorrect')
        console.log('loginAdmin - flag 1');
        return res.redirect('/admin/login')
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

//------------------------------------------------------- PRODUCTS CONTROLLER

const addProducts = asyncHandler(async (req, res) => {
    const { name, category, brand, price, stock, status } = req.body

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
        image: imagePath,
        status,

    })
    console.log('addProducts - products created');
    // const products = await productModel.find().sort({ createdAt: -1 })
    return res.redirect('/admin/products')
})



const editProducts = asyncHandler(async (req, res) => {
    const { name, category, brand, price, stock, status } = req.body

    const productId = req.params.id
    const selectedProduct = await productModel.findById(productId)

    if (req.file) {
        const newImagePath = `/img/uploads/${req.file.filename}`
        const oldImagePath = path.join(__dirname, '...', 'public', selectedProduct.image)

        if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath)
            console.log('editProducts - oldImagedelted');

        }
        selectedProduct.image = newImagePath
    }
    // console.log('editProducts - flage 1');

    // await imageUpdate.save()
    selectedProduct.name = name,
        selectedProduct.category = category,
        selectedProduct.brand = brand,
        selectedProduct.price = price,
        selectedProduct.stock = stock,
        selectedProduct.status = status,
        await selectedProduct.save()

    // console.log('editProducts - flage 2');
    // const products = await productModel.find()
    return res.redirect('/admin/products')
})


const deleteProduct = asyncHandler(async (req, res) => {
    const productId = req.params.id

    await productModel.findByIdAndDelete(productId)
    return res.redirect('/admin/products')

})



// -------------------------------------------------------CUSTOMER CONTROLLER

const blockCustomer = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    console.log('blockCustomer - userId =', userId);
    
    if (!userId) {
        req.flash('error', 'No user exists');
        return res.redirect('/admin/customers');
    }
    
    const user = await userModel.findById(userId);
    if (!user) {
        req.flash('error', 'User not found');
        return res.redirect('/admin/customers');
    }
    
    const newStatus = user.status === 'Blocked' ? 'Active' : 'Blocked';
    await userModel.findByIdAndUpdate(userId, { status: newStatus });
    
    req.flash('success', `Customer status set to ${newStatus}`);
    return res.redirect('/admin/customers');
});



const deleteCustomer = asyncHandler(async (req, res) => {
    const userId = req.params.id
    if (!userId) {
        req.flash('error', 'No user exists')
        return res.redirect('/admin/customers')
    }
    
    const deleteAddress = await addressesModel.deleteMany({ user: userId })
    console.log('delteCustomer - deleteAdress =', deleteAddress);
    
    
    
    await userModel.findByIdAndDelete(userId)
    res.clearCookie('userToken')
    
    return res.redirect('/admin/customers')
    
    
})

// -------------------------------------------------------ORDERS CONTROLLER







module.exports = {
    loginAdmin,
    addProducts,
    editProducts,
    deleteProduct,
    blockCustomer,
    deleteCustomer,

}