// IMPORT DEPENDENCY
const express = require('express');
require('dotenv').config();
const path = require('path')
const PORT = process.env.PORT || 8000;
const cookieParser = require('cookie-parser')
const session = require('express-session')
const flash = require('connect-flash')
const connectFlash = require('./middlewares/connect-flash')




// IMPORT MODULES
const { connectMongoDB } = require('./connect');
const staticRoutesUser = require('./routes/user/staticRoutes')
const authRoutesUser = require('./routes/user/authRoutes')
const staticRoutesAdmin = require('./routes/admin/staticRoutesAdmin')
const authRoutesAdmin = require('./routes/admin/authRoutesAdmin')
const passport = require('passport');
const passportSetup = require('./config/passport');  // IMPORTANT 
const stripeRoutes = require('./routes/user/stripeRoutes')


// MIDDLEWARES
const app = express();
const stripeWebhookRoute = require('./routes/user/stripeWebhookRoute');
app.use('/', stripeWebhookRoute)

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
app.use(connectFlash)


// REMOVED RES.LOCALS USER FROM HERE AND ADDED TO THE DOWN 

// RES.LOCALS 
app.use((req, res, next) => {
    // console.log('req.flash =', req.session.flash);
    // res.locals.success = null;
    // res.locals.error = null
    res.locals.user = null
    res.locals.message = null;
    res.locals.orders = null,
        res.locals.products = null
    next();
});





app.use(async (req, res, next) => {
    // First, check if user is authenticated via Passport (Google OAuth)
    if (req.user) {
        // User is authenticated via Passport
    } 
    // If not, check if JWT token exists and verify it
    else if (!req.auth) {
        try {
            const jwt = require('jsonwebtoken');
            const token = req.cookies?.userToken;
            
            if (token) {
                const payload = jwt.verify(token, process.env.secretKey);
                req.auth = payload;
            }
        } catch (error) {
            console.log('JWT verification failed in cart middleware:', error.message);
        }
    }

    // Now check if user is authenticated (either way)
    if (!req.user && !req.auth) {
        res.locals.cartCount = 0;
        res.locals.wishlistCount = 0;
        return next();
    }
    
    const userId = req.auth?.id || req.user?.id;
    
    const cartModel = require('./models/cart');
    const wishlistModel = require('./models/wishlist');

    try {
        const cart = await cartModel.findOne({ user: userId });
        const wishlist = await wishlistModel.findOne({ user: userId });

        res.locals.cartCount = cart
            ? cart.products.reduce((sum, item) => sum + item.quantity, 0)
            : 0;

        res.locals.wishlistCount = wishlist
            ? wishlist.products.length
            : 0;
    } catch (error) {
        console.log('Error fetching cart/wishlist:', error.message);
        res.locals.cartCount = 0;
        res.locals.wishlistCount = 0;
    }

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

app.use('/', stripeRoutes)



// CONNECT 
connectMongoDB();

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
