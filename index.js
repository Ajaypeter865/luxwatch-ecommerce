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
const staticRoutes = require('./routes/staticRoutes')
const authRoutes = require('./routes/authRoutes')
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


app.use(passport.initialize());
app.use(passport.session());
app.use(flash())


// SET EJS
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, "views"))
app.use(express.static(path.join(__dirname, 'public')))
app.use('/node_modules', express.static(__dirname + '/node_modules'))

// ROUTES
app.use('/', staticRoutes)
app.use('/', authRoutes)



// CONNECT 
connectMongoDB();

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
