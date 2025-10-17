// IMPORT DEPENDENCY
const asyncHandler = require('express-async-handler')


const gethomePageAdmin = asyncHandler(async (req,res) => {
    return res.render('admin/adminIndex')    
})

const getloginPageAdmin = asyncHandler(async (req,res) => {
    return res.render('admin/adminLogin')    
})

module.exports = {
    gethomePageAdmin,
    getloginPageAdmin
}