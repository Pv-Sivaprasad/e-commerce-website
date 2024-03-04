const express = require('express');
const userRoute = express.Router();
const passport = require('passport');
const userController = require('../controller/userCon');
const config=require('../config/config')
const auth=require('../middleware/userAuth')

// Middleware
userRoute.use(express.json());
userRoute.use(express.static('public'));
userRoute.use(express.urlencoded({ extended: true }));




// User Login Otp Verification Routes
userRoute.get('/', auth.isLogout,userController.home);

userRoute.get('/home', auth.isLogin,userController.home);

userRoute.get('/login',auth.isLogout, userController.login);

userRoute.get('/newUser',auth.isLogout,userController.userRegistration);

userRoute.post('/newUser',auth.isLogout, userController.createUser);

userRoute.get('/logout', userController.logout);

userRoute.get('/otp',auth.isLogout, userController.verifyOtp)

userRoute.post('/otp',auth.isLogout, userController.verifyOtp)

userRoute.get('/signin', userController.verifyLogin)

userRoute.post('/signin', userController.verifyLogin)

userRoute.get('/test', userController.loginHome)

userRoute.get('/gg',userController.loginHome)

userRoute.get('/resend-otp',userController.resendOtp)

userRoute.post('/resend-otp',userController.resendOtp)



// Google OAuth routes
userRoute.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

userRoute.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    // Successful authentication, redirect to home page or dashboard
    res.render('users/gg');
});


// Facebook OAuth routes
userRoute.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));
userRoute.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect to a different page
    res.render('users/facebook');
  });


module.exports = userRoute;






