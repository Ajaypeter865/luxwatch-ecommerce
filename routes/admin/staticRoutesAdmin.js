// IMPORT DEPENDENCY

const express = require("express");
const router = express.Router()

// IMPORT MODULES
const { gethomePageAdmin, getloginPageAdmin } = require('../../controllers/admin/getControllersAdmin')

// IMPORT MIDDLEWARE
const { proctedAuth, proctedAuthAdmin } = require('../../middlewares/auth')


// ROUTES
router.get('/admin', proctedAuthAdmin, gethomePageAdmin)
router.get('/admin/login', getloginPageAdmin)


module.exports = router