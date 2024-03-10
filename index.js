const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const path = require('path');
const noCache = require('nocache');
const morgan = require('morgan');
const flash = require('connect-flash');
const userRoute = require('./routes/userRoute');
const adminRoute = require('./routes/adminRoute');
const GoogleSignIn = require('./model/googleSignIn');
const FacebookUser = require('./model/facebookSignIn');

// Load environment variables from .env file
require('dotenv').config();

const app = express();
const port = process.env.PORT || 7000;

//Set up view engine and static files
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(flash());
app.use(session({
    secret: 'SECRET',
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(noCache());

// Connect to MongoDB using environment variable
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Connected to MongoDB");

        // Passport setup for Google authentication
        passport.use(new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:7000/auth/google/callback"
        },
            async function (accessToken, refreshToken, profile, cb) {
                try {
                    // Search for the user in the database based on Google profile ID
                    let user = await GoogleSignIn.findOne({ googleId: profile.id });
                    if (!user) {
                        // Create a new user if not found in the database
                        user = new GoogleSignIn({
                            googleId: profile.id,
                            displayName: profile.displayName,
                            email: profile.emails[0].value
                        });
                        await user.save();
                    }
                    return cb(null, user);
                } catch (error) {
                    return cb(error);
                }
            }
        ));

        // Serialize and deserialize user functions
        passport.serializeUser(function (user, done) {
            done(null, user);
        });

        passport.deserializeUser(function (obj, done) {
            done(null, obj);
        });

        // Passport setup for Facebook authentication
        passport.use(new FacebookStrategy({
            clientID: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
            callbackURL: "http://localhost:7000/auth/facebook/callback",
            profileFields: ['id', 'displayName', 'email']
        },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // Checking  the user  db
                    let user = await FacebookUser.findOne({ facebookId: profile.id });
                    if (!user) {
                        // If the user does not exist, create a new user
                        user = new FacebookUser({
                            facebookId: profile.id,
                            displayName: profile.displayName,
                            email: profile.emails ? profile.emails[0].value : null
                        });
                        // Save the user to the database
                        await user.save();
                    }
                    // Pass the user object to the next middleware
                    return done(null, user);
                } catch (error) {
                    // If an error occurs, pass it to the error handler
                    return done(error);
                }
            }
        ));


        


        // Start the server
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error);
    });


// Routes
app.use('/', userRoute);
app.use('/admin', adminRoute);


app.use((req, res, next) => {
    res.status(404).render('users/error');
});


