const Admin = require('../model/adminModel')
const googleSignIn = require('../model/googleSignIn')
const User = require('../model/userModel')
const Category = require('../model/categoryModel')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId


// for the passwording hashing security
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
const logout = async (req, res) => {
  try {

    res.redirect('/admin/login')
  } catch (error) {
    console.log('error logging out');
  }
}

// cross-checking admin login
const verifyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(email, password);

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
const loadDasboard = async (req, res) => {
  try {
    res.render('dashboard')
  } catch (error) {
    console.log(error);
    console.log('error rendering loadDashoard');
  }
}

// to display the users in admin dahboard
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

//for blocking and unblocking user 
const userBlock = async (req, res) => {
  try {
    const user_id = req.body.user_id;
    const userData = await User.findById(user_id);

    userData.is_blocked = !userData.is_blocked;
    await userData.save();

    res.json({ res: true, is_blocked: userData.is_blocked });

  } catch (error) {
    console.log('error changing blocking status');
    console.log(error);
    res.status(500).json({ res: false, error: 'Internal server error' });
  }
}
// to showcase all the categories
const allCategory = async (req, res) => {
  try {
    const categories = await Category.find();
    
    res.render('allCategories', { categories });
  } catch (error) {
    console.log('Error loading categories:', error);
    res.status(500).send('Internal Server Error');
  }
}
// to render add category page
const addCategory = async (req, res) => {
  try {
    console.log('started');
    return res.render('addCategory')
    console.log('finished');
  } catch (error) {
    console.log('error adding category');
  }
}
//to add a new category
const addCat = async (req, res) => {
  try {
    console.log("req", req.body, req.file); // Check if file is properly received
    let { catName, description } = req.body;

    // Check if category name already exists
    const regexPattern = new RegExp(`^${catName}$`, 'i');
    const alreadyExist = await Category.find({ catName: regexPattern });

    if (alreadyExist.length > 0) {
      return res.redirect('/admin/addCategory');
    }
    console.log("files",req.file);
    // Create new category instance
    const newCategory = new Category({
      catName: catName,
      description: description,
      image: req.file ? req.file.filename : null // Store image path if file is uploaded
    });

    // Save the new category to the database
    const save = await newCategory.save();

    if (save) {
      return res.redirect('/admin/allcategory');
    } else {
      console.log('error in returning');
      return res.status(500).json({ error: 'Error in adding category' });
    }
  } catch (error) {
    console.log('error in adding category');
    console.log(error);
    return res.status(500).json({ error: 'Error in adding category' });
  }
}

//to render edit category page
const editCategory=async(req,res)=>{
  try {
    console.log('editing start');
    const id=req.query.id
    console.log(id);
    const catData=await Category.findById({_id:id})
    console.log(catData);
    if(catData){
      res.render('editCategory',{category:catData})
    }else{
      res.redirect('/admin/allCategory')
    }
   
  } catch (error) {
    console.log('error loading edit cat page');
    console.log(error);
  }
}

const editCat = async (req, res) => {
  try {
    const { catName, description } = req.body;
    const image = req.file ? req.file.filename : req.body.image; 

 
    const existing = await Category.findOne({ catName: catName });

    if (existing) {
      console.log('Category with this name already exists');
      return res.redirect('/admin/allCategory');
    }

    
    const catData = await Category.findByIdAndUpdate(
      { _id: req.body.id },
      {
        $set: {
          catName: catName,
          description: description,
          image: image 
        }
      },
      { new: true } 
    );

    console.log('Updated category:', catData);
    console.log('Category updated successfully');
    res.redirect('/admin/allCategory');
  } catch (error) {
    console.log('Error editing category:', error);
    res.status(500).send('Error editing category');
  }
};


// to block and unblock categories
const catBlock = async (req, res) => {
  try {
    const categoryId = req.params.cat_id;
    const action = req.body.action;

    // Find the category by ID
    const category = await Category.findById(categoryId);

    // Toggle the is_Blocked property based on the action
    category.is_Blocked = action === "unblock" ? false : true;

    // Save the updated category
    const updatedCategory = await category.save();

    res.status(200).json({ success: true, category: updatedCategory });
  } catch (error) {
    console.log('Error in blocking/unblocking category:', error);
    res.status(500).json({ success: false, error: 'Error in blocking/unblocking category' });
  }
}


module.exports = {
  loginPage,
  verifyLogin,
  loadDasboard,
  logout,
  allUsers,
  userBlock,
  allCategory,
  addCategory,
  addCat,
  catBlock,
  editCategory,
  editCat
  
}