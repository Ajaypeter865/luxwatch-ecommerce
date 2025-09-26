const passport = require('passport')
require('dotenv').config()

const GoogleStratergy = require('passport-google-oauth20')

passport.use(new GoogleStratergy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'

}))
