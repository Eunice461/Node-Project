const fs = require('fs')
const path = require('path')
const https = require('https')
const express = require('express')
const helmet = require('helmet')
const passport = require('passport')
const { Strategy } = require('passport-google-oauth20')
const cookieSession = require('cookie-session')
const { verify } = require('crypto')
const UserInfoError = require('passport-google-oauth20/lib/errors/userinfoerror')

require('dotenv').config()

const PORT = 3000

const config = {
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    COOKIE_KEY_1: process.env.COOKIE_KEY_1,
    COOKIE_KEY_2: process.env.COOKIE_KEY_2
}

const AUTH_OPTIONS = {
    callbackURL: '/auth/google/callback',
    clientID: config.CLIENT_ID,
    clientSecret: config.CLIENT_SECRET,
  };
  
//use to get our profile from gooogle
function verifyCallback(accessToken, refreshToken, profile, done) {
    console.log('Google profile', profile);
    done(null, profile);
  }
  
passport.use(new Strategy(AUTH_OPTIONS, verifyCallback));

//Serializeuser is when we save the session to the cookie
passport.serializeUser((user, done) => {
    //passing the id mean we want the session to send back only the id to avoid sending in more datas because our cookies can only save 4kb on the browesr
    // we can either send the obj or the id
    done(null, user.id)
})

//Deserializeuser is when we read the session from the cookie
passport.deserializeUser((id, done) => {
    done(null, id)
})

//FOR DATABASE
// //looking for user.id provided in the serializeuser in the database using the id provide for goggle that is been save in our database
// passport.deserializeUser((id, done) => {
//     // the User is the name used to store our user schema in the database
//     User.findById(id).then( user => {
//         done(null, user)
//     })
// })
const app = express();

app.use(helmet());

app.use(cookieSession({
    name: 'session',
    maxAge: 24 * 60 * 60 * 1000,
    keys: [ config.COOKIE_KEY_1, config.COOKIE_KEY_2 ]
}))

app.use(passport.initialize())

// it keep track of our loginin users
app.use(passport.session())

function checkLoggedIn(req, res, next) {
    const isLoggedIn = true;
    if(!isLoggedIn){
        return res.status(401).json({
            error: 'you must log in'
        })
    }
    next();
}

app.get('/auth/google', passport.authenticate('google', {
    scope: ['email'],
}))

app.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: '/failure',
    successRedirect: '/',
    session: true,
}), 
(req, res) => {
    console.log('Google called us back');
}
);

app.get('/auth/logout', (req, res) => {})

app.get('/secret', checkLoggedIn, (req, res) => {
    return res.send('Your personal number is 42')
})

app.get('/failure', (req, res) => {
    return res.send('Failed to log in!')
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
}, app).listen(PORT, () => {
    console.log(`Server is Listening on port ${PORT}`);
})