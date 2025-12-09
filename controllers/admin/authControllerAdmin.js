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
const couponModel = require('../../models/coupon')
const bannerModel = require('../../models/banner')

const transporter = require('../../utils/mailer')
const enquiryModel = require('../../models/enquiry')




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
    const { name, category, brand, price, stock, status, discription } = req.body;


    let imagePaths = [];

    if (req.files && req.files.length > 0) {
        imagePaths = req.files.map(f => `/img/uploads/${f.filename}`);
    }

    await productModel.create({
        name,
        category,
        brand,
        price,
        stock,
        status,
        description: discription,
        image: imagePaths   // IMPORTANT → use image
    });

    return res.redirect('/admin/products');
});


const editProducts = asyncHandler(async (req, res) => {
    const { name, category, brand, price, stock, status, deleteImages } = req.body

    const productId = req.params.id
    console.log('editProducts - productId', productId);

    const selectedProduct = await productModel.findById(productId)

    // Handle deletion of selected images
    if (deleteImages) {
        // deleteImages could be a string (single image) or array (multiple images)
        const imagesToDelete = Array.isArray(deleteImages) ? deleteImages : [deleteImages]

        imagesToDelete.forEach(imagePath => {
            const fullImagePath = path.join(__dirname, '...', 'public', imagePath)

            if (fs.existsSync(fullImagePath)) {
                fs.unlinkSync(fullImagePath)
                console.log('editProducts - image deleted:', imagePath)
            }
        })

        // Remove deleted images from the product's image array
        selectedProduct.image = selectedProduct.image.filter(img => !imagesToDelete.includes(img))
    }

    // Handle new image upload
    if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
            const newImagePath = `/img/uploads/${file.filename}`
            selectedProduct.image.push(newImagePath)
        })
    }

    // Update other product fields
    selectedProduct.name = name
    selectedProduct.category = category
    selectedProduct.brand = brand
    selectedProduct.price = price
    selectedProduct.stock = stock
    selectedProduct.status = status

    await selectedProduct.save()

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

const updateOrderStatus = asyncHandler(async (req, res) => {

    const orderId = req.params.id
    console.log('updateOrderStatus - orderId =', orderId);

    const { status } = req.body
    // console.log('updateOrderStatus - req.body =', req.body);

    const order = await orderModel.findByIdAndUpdate(orderId, { orderStatus: status })

    console.log('updateOrderStatus - order =', order);

    return res.redirect('/admin/orders')

})

// -------------------------------------------------------COUPON CONTROLLER

const createCoupon = asyncHandler(async (req, res) => {

    try {
        const { code, discountValue, expiryDate, minPurchase } = req.body
        const coupons = await couponModel.create({
            code,
            expiryDate,
            discountValue,
            minPurchase
        })
        await coupons.save()
        return res.redirect('/admin/coupons')

    } catch (error) {
        console.log('Error from createCoupon =', error.message, error.stack);
        return res.redirect('/error')
    }
})

const updateCoupon = asyncHandler(async (req, res) => {
    try {
        const { code, expiryDate, discountValue, minPurchase } = req.body

        const couponId = req.params.id
        const coupons = await couponModel.findByIdAndUpdate(couponId, {
            code,
            expiryDate,
            discountValue,
            minPurchase
        })
        return res.redirect('/admin/coupons')

    } catch (error) {
        console.log('Error from updateCoupon =', error.message, error.stack);
        return res.redirect('/error')
    }
})

const deleteCoupon = asyncHandler(async (req, res) => {
    try {

        const couponId = req.params.id

        console.log('deleteCoupon - couponId =', couponId);

        await couponModel.findByIdAndDelete(couponId)

        return res.json({ success: true, message: "Deleted!" })

    } catch (error) {
        console.log('Error from deleteCoupon =', error.message, error.stack);
        return res.redirect('/error')

    }

})

const unblockCoupon = asyncHandler(async (req, res) => {
    try {
        const couponId = req.params.id
        console.log('unblockCoupon - couponId =', couponId);
        const active = await couponModel.findByIdAndUpdate(couponId, { active: true }, { new: true })
        return res.json({ message: 'Success', active })

    } catch (error) {
        console.log('Error from blockCoupon =', error.message, error.stack);
        return res.redirect('/error')

    }

})

const blockCoupon = asyncHandler(async (req, res) => {
    try {
        const couponId = req.params.id
        console.log('blockCoupon - couponId =', couponId);
        const active = await couponModel.findByIdAndUpdate(couponId, { active: false }, { new: true })
        return res.json({ message: 'Success', active })

    } catch (error) {
        console.log('Error from blockCoupon =', error.message, error.stack);
        return res.redirect('/error')

    }

})


// --------------------------------------------------- ENQUIRY CONTROLLER

const sendReply = asyncHandler(async (req, res) => {


    try {
        const { email, reply, enquiryId } = req.body

        if (!email && !reply) {
            req.flash('error', 'Invalid input')
            res.json({ success: flase })
        }

        await transporter.sendMail({
            from: `"Time Zone" <${process.env.emailUser}>`,
            to: email,
            subject: 'Support reply',
            text: reply

        })

        await enquiryModel.findByIdAndUpdate(enquiryId, {
            reply: true,
            status: 'Resolved'
        })

        res.json({ success: true })

    } catch (error) {
        console.log('Error from sendReply =', error.message, error.stack);
        return res.redirect('/error')

    }

    return res.json({ success: true })


})

const resolveButton = asyncHandler(async (req, res) => {

    try {

        const { id } = req.body

        if (!id) {
            req.flash('error', 'No id found')
            return res.json({ success: false })
        }

        await enquiryModel.findByIdAndUpdate(id, {
            status: 'Resolved',
            reply: true
        })

        return res.json({ success: true })

    } catch (error) {
        console.log('Error in resolveButton =', error.message, error.stack);
        return res.redirect('/error')
    }

})

// --------------------------------------------------- BANNER CONTROLLERS

const uploadBanner = asyncHandler(async (req, res) => {

    try {
        const { main, sub, bannerImage } = req.body
        console.log('uploadBanner - req.body =', req.body);

        console.log('uploadBanner - req.file', req.file);

        if (!req.file) {
            req.flash('error', 'No file selected')
            return res.redirect('/admin/banner')
        }

        const imagePath = `/img/uploads/${req.file.filename}`



        await bannerModel.create({
            main,
            sub,
            bannerImage: imagePath,
        })

        return res.redirect('/admin/banner')
    } catch (error) {
        console.log('Error from uploadBanner', error.message, error.message);
        return res.redirect('/error')

    }


})

const deleteBanner = asyncHandler(async (req, res) => {


    try {
        const bannerId = req.params.id
        console.log('deleteBanner - bannerId', bannerId);

        await bannerModel.findByIdAndDelete(bannerId)

        return res.redirect('/admin/banner')

    } catch (error) {

        console.log('Error in deleteBanner', error.message,error.stack);
        return res.redirect('/error')
        

    }


})


// ---------------------------------------------------LOGOUT 

const logoutAdmin = async (req, res) => {

    res.clearCookie('adminToken')
    res.render('user/login')

}

module.exports = {
    loginAdmin,
    addProducts,
    editProducts,
    deleteProduct,
    blockCustomer,
    deleteCustomer,
    updateOrderStatus,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    unblockCoupon,
    blockCoupon,
    sendReply,
    resolveButton,
    logoutAdmin,
    uploadBanner,
    deleteBanner,

}