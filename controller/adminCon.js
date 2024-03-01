const Admin = require('../model/adminModel')
const googleSignIn = require('../model/googleSignIn')


const User = require('../model/userModel')


const bcrypt = require('bcrypt')


const mongoose = require('mongoose')

const ObjectId = mongoose.Types.ObjectId



const securePassword = async (req, res) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error);
  }

}

//login for admin
const loginPage = async (req, res) => {
  try {
    res.set("Cache-control", "no-store")
    console.log("admin login page")
    res.render('login')
  } catch (error) {
    console.log(error);
  }
}

// logout from admin
const logout=async(req,res)=>{
  try {
    req.session.destroy()
    res.redirect('admin/login')
  } catch (error) {
    console.log('error logging out');
  }
}

// cross-checking admin login
const verifyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(email,password);

    const adminData = await Admin.findOne({ email: email });

    if (adminData) {
      console.log('Stored Password:', adminData); // Log the stored password
      const passwordMatch = await bcrypt.compare(password, adminData.password);

      console.log('Password Match:', passwordMatch); // Log the result of password comparison

      if (passwordMatch) {
        res.set('Cache-control', 'no-store');
        req.session.adminId = true;
        return res.redirect('/admin/dashboard'); // Redirect if password matches
      } else {
        req.session.loginError = 'Invalid password';
        console.log('Password does not match');
        return res.redirect('/admin/login');
      }
    } else {
      req.session.loginError = 'Invalid Email Id';
      console.log('Email does not match');
      return res.redirect('/admin/login');
    }
  } catch (error) {
    console.log('Failed to connect to dashboard', error);
    req.session.loginError = 'Failed to connect to dashboard';
    return res.redirect('/admin/login');
  }
};

//loading admin dashboard
const loadDasboard=async(req,res)=>{
  try {
    res.render('dashboard')
  } catch (error) {
    console.log(error);
    console.log('error rendering loadDashoard');
  }
}

const allUsers = async (req, res) => {
  try {
    res.set('Cache-control', 'no-store');
    
    // Fetch users from the existing User model
    const regularUsers = await User.find({});
    console.log('1');
    // Fetch users from GoogleSignIn model
    // const googleUsers = await googleSignIn.find({});
    // console.log('11');
    // Fetch users from FacebookUser model
    // const facebookUsers = await facebookUsers.find({});
    console.log('111');
    // Render the userList template with all user data
    res.render('userList', { users: regularUsers });
    console.log('112');
  } catch (error) {
    console.log('Error loading user list:', error);
    res.status(500).send('Internal Server Error');
  }
}

// const userBlock=async(req,res)=>{
// try {
//     const user_id=req.body.user_id;
   
//     const userData=await User.findOne({_id:user_id})

//     if(!userData.is_blocked){
//       await User.findByIdAndUpdate({_id:user_id},{$set:{is_blocked:true}})
//     }else{
//       await User.findByIdAndUpdate({_id:user_id},{$set:{is_blocked:false}})
//     }
//     res.json({res:true})

// } catch (error) {

//   console.log('error changing blocking status ');
//   console.log(error);
// }
// }
const userBlock = async (req, res) => {
  try {
      const user_id = req.body.user_id;
      const userData = await User.findOne({_id: user_id});

      // Toggle is_blocked field
      userData.is_blocked = !userData.is_blocked;
      await userData.save();

      res.json({res: true, is_blocked: userData.is_blocked});

  } catch (error) {
      console.log('error changing blocking status');
      console.log(error);
      res.status(500).json({res: false, error: 'Internal server error'});
  }
}

module.exports = {
  loginPage,
  verifyLogin,
  loadDasboard,
  logout,
  allUsers,
  userBlock
}