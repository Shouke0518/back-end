const passport = require('passport');
const { Strategy } = require('passport-local');
const User = require('../database/schemas/User');
const { comparePassword } = require('../utils/helpers');

passport.use(
    new Strategy(
        {
            usernameField: 'email',
        },
        async (email, password, done) => {
            try {
                if (!email || !password) throw new Error('Missing Credentials');
                const userDB = await User.findOne({ email });
                if (!userDB) throw new Error('User not found');
                if (comparePassword(password, userDB.password)) {
                    console.log('Authenticated Successfully!');
                    done(null, userDB);
                } else {
                    console.log('Invalid Authentication');
                    done(null, null);
                }
            } catch (err) {
                console.log(err);
                done(err, null);
            }
        }
    )
);
