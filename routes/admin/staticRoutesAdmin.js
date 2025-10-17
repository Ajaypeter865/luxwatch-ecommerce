// IMPORT DEPENDENCY

const express = require("express");
const router = express.Router()

// IMPORT MODULES

const { gethomePageAdmin, getloginPageAdmin } = require('../../controllers/admin/getControllersAdmin')

// ROUTES
router.get('/admin', gethomePageAdmin)
router.get('/admin/login', getloginPageAdmin)


module.exports = router