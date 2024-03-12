const User = require('../model/userModel')
const bcrypt = require('bcrypt')
const config = require('../config/config')
const Category = require('../model/categoryModel')
const Product = require('../model/productModel')
const nodemailer = require('nodemailer')
const speakeasy = require('speakeasy');
const otpGenerator = require('otp-generator')
const OTP = require('../model/otpModel')
const otpModel = require('../model/otpModel')
require('dotenv').config()
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const randomString = require('randomstring')




// to hash the password
const securePassword = async (password) => {
    try {

        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash;

    } catch (error) {
        console.log(error.message);
    }
}


// for loading the home page
const home = async (req, res) => {
    try {
   if(req.session.user_id){
    res.render('users/userhome')
   }else{
    res.render('users/home')
   }
   
 
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
}


// for login details page
const login = async (req, res) => {
    try {
        res.render('users/login');
    } catch (error) {
        console.log(error);
        // Handle error appropriately
        res.status(500).send('Internal Server Error');
    }
};

// to logout 
const logout = async (req, res) => {
    try {
      req.session.user_id=false
        res.redirect('/')
    } catch (error) {
        console.log('error louserhomeing out');
    }
}

//new user registration
const newUser = async (req, res) => {
    try {
        res.render('users/newUser')
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');

    }
}

const userRegistration = async (req, res) => {
    try {
        res.set("Cache-control", "no-store")
        res.render('users/newUser')
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error'); // Handle any unexpected errors
    }
}



//node mailer Transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    },
});
// otp creating 
const secret = speakeasy.generateSecret({ length: 20 })



// Function to create a new user
const createUser = async (req, res) => {
    try {
        console.log('entered here');
        const name = req.body.name;
        const email = req.body.email;
        const mobile = req.body.mobile;
        const password = req.body.password;
        const confirmPassword = req.body.confirmPassword;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const nameRegex = /^[a-zA-Z]+(?: [a-zA-Z]+)?$/;
        const mobileRegex = /^\d{10}$/;    //chang e it to 10
        // const passwordRegex = /^[a-zA-Z0-9!@#$%^&*]+\S{8}$/;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*]{8,}$/;


        


        console.log(name, email, mobile, password, confirmPassword);

        if (!emailRegex.test(email)) {
            res.json('Invalid Email ID');
        } else if (password !== confirmPassword || !password || password.includes(" ")) {
            console.log('Invalid password');
            res.json('Invalid password');
        }
        else if (!passwordRegex.test(password)) {

            console.log('Invalid password format');
            res.json('Invalid password format');

        }
        else if (!mobileRegex.test(mobile)) {
            console.log('Invalid mobile number');
            res.json('Invalid mobile number');

        }
        else if (!nameRegex.test(name)) {
            console.log("Invalid name");
            res.json("Invalid name");
        } else {
            const existingUser = await User.findOne({ email: email });
            if (existingUser) {
                console.log('Existing email');
                res.json('Email already exists');
            } else if ( email.includes(" ") || mobile.includes(" ")) {
                console.log("Please Avoid Spaces");
                res.json("Please avoid spaces");
            } else {
                console.log('Registration is successful');

                const spassword = await securePassword(req.body.password);

                const user = new User({
                    name: name,
                    email: email,
                    mobile: mobile,
                    password: spassword,
                    is_verified: false,
                });
                console.log(user);
                await user.save();

                console.log('User saved successfully:', user);

                req.session ? console.log('Session exists') : console.log('Session error');
                req.session.userData = user;

                const secret = speakeasy.generateSecret({ length: 20 }); // Generate secret for OTP

                const otp = speakeasy.totp({
                    secret: secret.base32,
                    encoding: 'base32'
                });

                const otpDB = new OTP({
                    userId: req.session.userData._id,
                    otp: otp
                });

                await otpDB.save();

                console.log('OTP saved to database:', otpDB);

                const mailOptions = {
                    from: 'sivaprasadpv777@gmail.com',
                    to: email,
                    subject: 'Your OTP Verification for Royal Oak Login',
                    text: `Your OTP for verification is ${otp}`
                    
                };

                console.log('Mail options:', mailOptions);



                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log('Failed to send email:', error);
                        return res.status(500).json({ error: "Failed to send OTP" });
                    } else {
                        console.log('Email sent:', info.response);
                        const data = [user._id, 'Mail Sent Successfully'];
                        res.render('users/otp')
                    }
                });
            }
        }
    } catch (error) {
        console.log("User creation not working");
        console.log('Failed to send:', error);
        return res.status(500).json({ error: false });
    }
};

//to verify otp
const verifyOtp = async (req, res) => {
    try {
        console.log('OTP verification');
       
        const currentOtp = req.body.otp.join('');
        console.log(currentOtp);

        const actualOtp = await OTP.findOne({ otp: currentOtp });
        console.log(actualOtp);
        if (!actualOtp) {
            console.log('Invalid OTP');
            return res.status(400).send('Invalid OTP');
        }

        const actualUser = await User.findById(actualOtp.userId);
        if (!actualUser) {
            console.log('User not found');
            return res.status(404).send('User not found');
        }

        console.log('OTP verified successfully');
        actualUser.is_verified = true;
        await actualUser.save();

        console.log('Redirecting to user login page');
        // Redirect to user login page after OTP verification
        res.redirect('/login');
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).send('Internal Server Error');
    }
}

const resendOtp = async (req, res) => {
    try {
        // Delete existing OTP  of user
        await OTP.deleteOne({ userId: req.session.userData._id });
        console.log('exisiting otp deleted just before');

        // Generate new OTP
        const secret = speakeasy.generateSecret({ length: 20 });
        const otp = speakeasy.totp({
            secret: secret.base32,
            encoding: 'base32'
        });

        // Save new OTP to the database
        const otpDB = new OTP({
            userId: req.session.userData._id,
            otp: otp
        });
        await otpDB.save();

        console.log('OTP saved to database:', otpDB);

        // Send email with the new OTP
        const mailOptions = {
            from: 'sivaprasadpv777@gmail.com',
            to: req.session.userData.email,
            subject: 'Your New OTP For Verification for Royal Oak Login',
            text: `Your OTP for verification is ${otp}`
        };

        console.log('Mail options:', mailOptions);

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Failed to send email:', error);
                return res.status(500).json({ error: "Failed to send OTP" });
            } else {
                console.log('Email sent:', info.response);
                res.render('users/otp');
            }
        });
    } catch (error) {
        console.log('Error sending OTP:', error);
        res.status(500).json({ error: "Failed to resend OTP" });
    }
}

//to verify the user login
const verifyLogin=async (req,res)=>{
    try {
        console.log('user login with details');
        const email=req.body.email;
        const password=req.body.password;
        console.log(email,password);

        const userData=await User.findOne({email:email})
        console.log('User Data:', userData);
        if(userData){
            const passwordMatch=await bcrypt.compare(password,userData.password)
            console.log(`updated email${email} userdata email ${userData.email}`);
            console.log(`updated password ${password} userdata password ${userData.password}`);

            if(passwordMatch){
                 if(!userData.is_blocked){
                    if(userData.is_verified){
                        console.log('success-log in');
                       

                        // const loginStatus=req.session.loginStatus
                        res.set('Cache-control','no-store')
                        req.session.user_id=userData._id
                        res.redirect('/userhome')
                    }else{
                        console.log('is_verified error');
                        req.session.login_error='Account Does Not Exsist'
                        res.redirect('/login')
                    }
                 }else{
                    console.log(' user is blocked');
                    req.session.login_error='Account Is Blocked'
                    res.redirect('/login')
                 }
            }else{
                console.log('pasword not matching');
                req.session.login_error='Invalid Password'
                res.redirect('/login')
            }

          }else{
            console.log('account issue ');
            req.session.login_error='Account Does not Exsist'
            res.redirect('/login')
          }
    } catch (error) {
        console.log('error louserhomeing in with user details');

    }
}

// to load homepage after login
const loginHome=async(req,res)=>{       
    try {
        res.render('users/userhome')
    } catch (error) {
        console.log(`erron in loading home after login`);
    }
}

// to load login product listed page
const allProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.render('users/userhome', { products: products });
    } catch (error) {
        console.log('Error loading all products');
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
}

// to load all the product details from products
const loadProductDetails=async(req,res)=>{
    try {
        const id=req.params.id

        const proData = await Product.findById({_id:id})
   console.log('proData',proData);
        if(proData){
            res.render('users/productDetails',{product:proData})
        }


    } catch (error) {
        console.log('error in loading product details page');
        console.log('error');
    }
}


const errorPage=async(req,res)=>{
    try {
        res.render('users/error')
    } catch (error) {
        console.log('error rendering error page');
        console.log(error);
    }
}

const loadProfilePage=async(req,res)=>{
try {
    let userData= await User.findOne({_id:req.session.user_id , is_blocked:0})

    console.log('userData is :',userData);
    res.render('users/profile',{user:userData})
} catch (error) {
    console.log('error loading profile page view only');
    console.log(error);
}
}

const loadEditProfile=async(req,res)=>{
    try {
        const userData=await User.findOne({_id:req.session.user_id})

        res.render('users/editprofile',{user:userData})
    } catch (error) {
        console.log('error loading editingpage');
        console.log(error)
    }
}


const renderProfileOTPPage = (req, res) => {
    try {
        // Render the profile OTP page
        res.render('users/profileotp');
    } catch (error) {
        console.error('Error rendering profile OTP page:', error);
        res.status(500).send('Internal Server Error');
    }
};
const editProfile = async (req, res) => {
    try {
        console.log('Starting editing profile');
        const existingData = await User.findOne({ _id: req.session.user_id });
        console.log('The existing userData:', existingData);

        const { name, email, mobile, password, confirmPassword } = req.body;

        console.log(name, email, mobile, password, confirmPassword );

        // Check if any of the fields are being updated
        if (
            req.session.name=name,
            req.session.email=email,
            req.session.mobile=mobile,
            req.session.password=password,

            existingData.mobile !== mobile ||
            existingData.email !== email ||
            existingData.password !== password
        ) {
            // If any of the fields are being updated, send email with OTP
            const secret = speakeasy.generateSecret({ length: 20 }); // Generate secret for OTP
            const otp = speakeasy.totp({
                secret: secret.base32,
                encoding: 'base32'
            });
            const otpDB = new OTP({
                userId: req.session.user_id,
                otp: otp
            });
            await otpDB.save();

            console.log('OTP saved to database:', otpDB);

            const mailOptions = {
                from: 'sivaprasadpv777@gmail.com',
                to: email,
                subject: 'Your OTP for profile update of Royal Oak',
                text: `Your OTP for profile update is ${otp}`
            };

            console.log('Mail options:', mailOptions);
           
            res.redirect('/profileotp')
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log('Failed to send email:', error);
                    return res.status(500).json({ error: "Failed to send OTP" });
                } else {
                    console.log('Email sent:', info.response);
                   
                   
                }
            });
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            // If no fields are being updated, directly update the name
            const updatedUser = await User.findByIdAndUpdate(
                { _id: req.session.user_id },
                { $set: { name: name } },
                { new: true }
            );
            console.log('Name updated successfully:', updatedUser);
        }

        // Handle other fields being updated if needed

    } catch (error) {
        console.error('Error editing profile:', error);
        res.status(500).send('Internal Server Error');
    }
};



const verifyProfileOtp=async(req,res)=>{
    
        try {
            console.log('OTP verification');
           
            const currentOtp = req.body.otp.join('')
            console.log(currentOtp);
    
            const actualOtp = await OTP.findOne({ otp: currentOtp });
            console.log(actualOtp);
            if (!actualOtp) {
                console.log('Invalid OTP');
                return res.status(400).send('Invalid OTP');
            }
    
            const actualUser = await User.findById(actualOtp.userId);
            if (!actualUser) {
                console.log('User not found');
                return res.status(404).send('User not found');
            }
    
            console.log('OTP verified successfully');
            actualUser.is_verified = true;
            await actualUser.save();

            // Hash the new password before updating the user profile
        const hashedPassword = await bcrypt.hash(req.session.password, 10);

            const updatedUser = await User.findByIdAndUpdate(
                { _id: req.session.user_id },
                { $set:{
                    name:req.session.name,
                    mobile:req.session.mobile,
                    email:req.session.email,
                    password:hashedPassword
                }

                 }
            );
    
            console.log('Redirecting to user profile page');
            // Redirect to user login page after OTP verification
            res.redirect('/profile');
        } catch (error) {
            console.error('Error verifying OTP:', error);
            res.status(500).send('Internal Server Error');
        }
    }





module.exports =
{
    login,
    home,
    newUser,
    userRegistration,
    createUser,
    verifyOtp,
    loginHome,
    logout,
    verifyLogin,
    resendOtp,
    allProducts,
    loadProductDetails,
    errorPage,



    loadProfilePage,
    loadEditProfile,
    editProfile,
    renderProfileOTPPage,
    verifyProfileOtp

}

