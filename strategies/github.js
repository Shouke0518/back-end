const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
require('dotenv').config();
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: `${BACKEND_URL}/auth/github/callback`
        },
        function (accessToken, refreshToken, profile, done) {
            console.log(profile);
            return done(null, profile);
        }
    )
);