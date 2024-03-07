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
userRoute.get('/', userController.home);

userRoute.get('/home', auth.isLogin,userController.home);

userRoute.get('/login',auth.isLogout, userController.login);

userRoute.get('/newUser',auth.isLogout,userController.userRegistration);

userRoute.post('/newUser',auth.isLogout, userController.createUser);

userRoute.get('/logout',auth.isLogin, userController.logout);

userRoute.get('/otp',auth.isLogout, userController.verifyOtp)

userRoute.post('/otp',auth.isLogout, userController.verifyOtp)

userRoute.get('/signin', auth.isLogin,userController.verifyLogin)

userRoute.post('/signin',auth.isLogout,userController.verifyLogin)

// userRoute.get('/test', userController.loginHome)

userRoute.get('/userhome',auth.isLogin,userController.allProducts)
// userRoute.post('/userhome',userController.allProducts)

userRoute.get('/resend-otp',userController.resendOtp)

userRoute.post('/resend-otp',userController.resendOtp)

userRoute.get('/productdetails/:id',userController.loadProductDetails)




// Google OAuth routes
userRoute.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

userRoute.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    // Successful authentication, redirect to home page or dashboard
    res.render('users/userhome');
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