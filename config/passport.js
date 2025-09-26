// IMPORT DEPENDENCY
const passport = require('passport')
const GoogleStratergy = require('passport-google-oauth20').Strategy
require('dotenv').config()

// MODULES
const userModel = require('../models/user')

passport.serializeUser((user,done){
    done (null,user.id)
})

// FUNCTIONS 
passport.use(new GoogleStratergy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:' + process.env.PORT + '/auth/google/callback'

},
   async (accessToken, refreshToken, profile, done) => {
    try {
        const user = await userModel.findOne({googleId: profile.id})
        if(!user)
        {}
    } catch (error) {
        
    }
        return done(null, profile);
    }
))
