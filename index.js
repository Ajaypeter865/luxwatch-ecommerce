// IMPORT DEPENDENCY
const express = require('express');
require('dotenv').config();
const path = require('path')
const PORT = process.env.PORT || 8000;
const cookieParser = require('cookie-parser')
const session = require('express-session')
const flash = require('connect-flash')




// IMPORT MODULES
const { connectMongoDB } = require('./connect');
const staticRoutesUser = require('./routes/user/staticRoutes')
const authRoutesUser = require('./routes/user/authRoutes')
const staticRoutesAdmin = require('./routes/admin/staticRoutesAdmin')
const authRoutesAdmin = require('./routes/admin/authRoutesAdmin')
const passport = require('passport');
const passportSetup = require('./config/passport');  // IMPORTANT 


// MIDDLEWARES
const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());
app.use(session({
    secret: process.env.sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}))

// PASSPORT JS 
app.use(passport.initialize());
app.use(passport.session());

// FLASH JS
app.use(flash())

// RES.LOCALS 
app.use(async (req, res, next) => {
    res.locals.user = null
    return next()
})

app.use((req, res, next) => {
    res.locals.message = null;
    res.locals.success = null;
    res.locals.error = null;
    res.locals.orders = null,
        res.locals.products = null
    next();
});



// ERROR HANDLER (ASYNC HANDLER)
app.use((err, req, res, next) => {
    console.error('--- Global Error Handler ---')
    console.error('Route:', req.originalUrl)
    console.error('Method:', req.method)
    console.error('Message:', err.message)
    console.error('Stack:', err.stack)
    console.error('-----------------------------')

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    })
})


// SET EJS
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, "views"))
app.use(express.static(path.join(__dirname, 'public')))
app.use('/node_modules', express.static(__dirname + '/node_modules')) // FOR TOASTIFY EJS

// ROUTES
app.use('/', staticRoutesUser)
app.use('/', authRoutesUser)
app.use('/', staticRoutesAdmin)
app.use('/', authRoutesAdmin)



// CONNECT 
connectMongoDB();

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
