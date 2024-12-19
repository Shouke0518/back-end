const { Router } = require('express');
const Test = require('../database/schemas/Test');
const passport = require('passport');
const User = require('../database/schemas/User');
const GoogleUser = require('../database/schemas/GoogleUser');
const GitHubUser = require('../database/schemas/GitHubUser');
const { hashPassword } = require('../utils/helpers');
const { send_mail } = require('../utils/mailSender');
const Brute = require('express-brute');
require('../strategies/github')
require('../strategies/google')
const router = Router();
const crypto = require('crypto');
const FRONTEND_URL = process.env.FRONTEND_URL || "https://front-end-c4wi.onrender.com" || 'http://localhost:8080';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

// // 然後使用
// res.redirect(`${FRONTEND_URL}/home`);
// const verificationLink = `${BACKEND_URL}/auth/verify?token=${token}`;

function generateStateParameter() {
    return crypto.randomBytes(16).toString('hex');
}

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// ----------------google-------------------
async function registerWithGoogle(oauthUser) {
    const isUserExists = await GoogleUser.findOne({
        name: oauthUser.displayName
    });
    if (isUserExists) {
        const failure = {
            message: 'User already Registered.',
        };
        return { failure };
    }

    const name = oauthUser.displayName;
    const email = oauthUser.emails[0].value;

    const googelUser = new GoogleUser({
        accountId: oauthUser.id,
        name: name,
        provider: oauthUser.provider,
        email: email,
        role: "user",
    });
    await googelUser.save();
    await User.create({ password: "123", email, name, phoneNumber: "0977888999", });
    const success = {
        message: 'User Registered.',
    };
    return { success };
}

router.get('/google', (req, res, next) => {
    const state = generateStateParameter();
    req.session.oauthState = state;
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        state: state
    })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
    const state = req.query.state;
    if (state !== req.session.oauthState) {
        return res.status(401).send('Invalid state parameter');
    }
    delete req.session.oauthState;
    passport.authenticate('google', { failureRedirect: '/error' })(req, res, next);
}, async (req, res) => {
    const { failure, success } = await registerWithGoogle(req.user);
    if (failure) {
        console.log('Google user already exist in DB..');
    } else {
        console.log('Registering new Google user..');
    }
    const userEmail = req.user.emails[0].value;
    res.redirect(`${FRONTEND_URL}/home?userEmail=${encodeURIComponent(userEmail)}`);
});

// ----------------github-------------------
const isLoggedIn = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        res.status(401).send('Not Logged In');
    }
}

router.get('/', isLoggedIn, (req, res) => {
    res.send(`Hello world ${req.user.username}`)
})
router.get('/error', (req, res) => res.send('Unknown Error'))

async function registerWithGitHub(oauthUser) {
    const isUserExists = await GitHubUser.findOne({
        name: oauthUser.username
    });
    if (isUserExists) {
        const failure = {
            message: 'User already Registered.',
        };
        return { failure };
    }

    const gitHubUser = new GitHubUser({
        name: oauthUser.username,
        provider: oauthUser.provider,
        email: oauthUser.emails[0].value,
        role: "user",
    });
    await gitHubUser.save();
    const success = {
        message: 'User Registered.',
    };
    return { success };
}

router.get('/github', (req, res, next) => {
    const state = generateStateParameter();
    req.session.oauthState = state;
    passport.authenticate('github', {
        scope: ['user:email'],
        state: state
    })(req, res, next);
});

router.get('/github/callback', (req, res, next) => {
    const state = req.query.state;
    if (state !== req.session.oauthState) {
        return res.status(401).send('Invalid state parameter');
    }
    delete req.session.oauthState; // 清除狀態參數
    passport.authenticate('github', { failureRedirect: '/error' })(req, res, next);
}, async (req, res) => {
    const { failure, success } = await registerWithGitHub(req.user);
    if (failure) {
        console.log('GitHub user already exist in DB..');
    } else {
        console.log('Registering new GitHub user..');
    }
    res.redirect(`${FRONTEND_URL}/home`);
});

// ----------------local-------------------
const store = new Brute.MemoryStore();
const bruteforce = new Brute(store, {
    freeRetries: 3,
    minWait: 30 * 60 * 1000,
    maxWait: 60 * 60 * 1000,
    lifetime: 24 * 60 * 60,
});
const bruteForceMiddleware = process.env.BRUTEFORCE_SWITCH === 'true' ? bruteforce.prevent : (req, res, next) => next();

router.post('/test', async (request, response) => {
    const {name, price} = request.body;
    const newTest = await Test.create({name, price});
    newTest.save();
});

router.post('/login', bruteForceMiddleware, passport.authenticate('local'), (req, res) => {
    console.log('Logged In');
    console.log(req.session);
    res.sendStatus(200);
});

router.post("/logout", (request, response) => {
    response.send(200);
});

router.post('/register', async (request, response) => {
    const { email } = request.body;
    const userDB = await User.findOne({ email });
    if (userDB) {
        response.status(400);
        response.send({ msg: 'User already exists!' });
    } else {
        const password = hashPassword(request.body.password);
        const name = request.body.name;
        const phoneNumber = request.body.phoneNumber;
        const role = request.body.role;
        const token = crypto.randomBytes(32).toString('hex');
        await User.create({ password, email, name, phoneNumber, role, verificationToken: token, verified: false });
        const verificationLink = `${BACKEND_URL}/auth/verify?token=${token}`;
        send_mail(email, "會員驗證", `Please verify your account by clicking <a href="${verificationLink}">here</a>`);
        response.send(201);
    }
});

router.get('/verify', async (req, res) => {
    const { token } = req.query;

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
        return res.status(400).send('Invalid token');
    }

    user.verified = true;
    user.verificationToken = undefined;
    await user.save();

    res.send('Your account has been verified!');
});

module.exports = router;