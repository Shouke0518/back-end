const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
require('dotenv').config();
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${BACKEND_URL}/auth/google/callback`,
        },
        function (accessToken, refreshToken, profile, done) {
            userProfile = profile;
            console.log(profile);
            return done(null, userProfile);
        }
    )
);