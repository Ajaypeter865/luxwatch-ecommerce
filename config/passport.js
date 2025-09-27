// IMPORT DEPENDENCY
const passport = require('passport')
const GoogleStratergy = require('passport-google-oauth20').Strategy
require('dotenv').config()

// MODULES
const userModel = require('../models/user')



// FUNCTIONS 

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
    try {
        const user = await userModel.findById(id)
       return done(null, user)
    } catch (error) {
        done(error, null)
    }
})


passport.use('google', new GoogleStratergy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:' + process.env.PORT + '/auth/google/callback'

},
    async (accessToken, refreshToken, profile, done) => {
        try {
            const mail = profile.emails[0].value
            if (!mail) {
                return done(null, false, { message: 'No email found' })
            }
            const existingUser = await userModel.findOne({ email: mail.toLowerCase() })
            console.log('existing user', existingUser);
            
            if (existingUser) {
                return done(null, false, { message: 'User already exists' })
            }

            
            console.log('Going to newuser');
            const newUser = await userModel.create({
                name: profile.displayName || profile.givenName,
                email: mail,
                googleId: profile.id,

            })
            await newUser.save()
        
            console.log('User created', newUser);
            
            return done(null, newUser)

        } catch (error) {
            console.log('error in passportJs = ', error.message, error.stack);
            return done(error, null)

        }
    }
))
