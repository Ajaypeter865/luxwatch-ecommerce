// IMPORT DEPENDENCY
const asyncHandler = require('express-async-handler')


const gethomePageAdmin = asyncHandler(async (req,res) => {
    return res.send('Hello from Admin Home')    
})

module.exports = {
    gethomePageAdmin
}