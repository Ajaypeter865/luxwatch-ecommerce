// IMPORT DEPENDENCY

const express = require("express");
const router = express.Router()

// IMPORT MODULES

const {gethomePageAdmin} = require('../../controllers/admin/getControllersAdmin')

// ROUTES
router.get('/admin' ,gethomePageAdmin)

module.exports = router