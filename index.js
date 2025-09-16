// IMPORT DEPENDENCY
const express = require('express');
require('dotenv').config();
const path = require('path')
const PORT = process.env.PORT || 8000;

// IMPORT MODULES
const { connectMongoDB } = require('./connect');
const staticRoutes = require('./routes/staticRoutes')
const authRoutes = require('./routes/authRoutes')

// MIDDLEWARES
const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


// SET EJS
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, "views"))
app.use(express.static(path.join(__dirname, 'public')))

// ROUTES
app.use('/', staticRoutes)
app.use('/', authRoutes)



// CONNECT 
connectMongoDB();

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
