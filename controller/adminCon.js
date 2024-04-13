const Admin = require('../model/adminModel')
const googleSignIn = require('../model/googleSignIn')
const User = require('../model/userModel')
const Category = require('../model/categoryModel')
const Order = require('../model/orderModel')
const Product = require('../model/productModel')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const validoator = require('validator')


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
    //  if( req.session.admin_id){
    //   console.log("admin login page")
    res.render('login')
    //  }

  } catch (error) {
    console.log(error);
  }
}

// logout from admin
const logout = async (req, res) => {
  try {
    req.session.admin_id = false

    res.redirect('/admin/login')
  } catch (error) {
    console.log('error logging admin out');
  }
}

// cross-checking admin login
const verifyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(email, password);

    const adminData = await Admin.findOne({ email: email });

    if (adminData) {
      console.log('Stored Password:', adminData); 
      const passwordMatch = await bcrypt.compare(password, adminData.password);

      console.log('Password Match:', passwordMatch); 

      if (passwordMatch) {
        res.set('Cache-control', 'no-store');
       
        return res.redirect('/admin/dashboard'); 
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

const loadDashboard = async (req, res) => {
  try {
    const deliveredOrders = await Order.find({ orderStatus: 'delivered' });
    const categories = await Category.find({});
    const products = await Product.find({});

    // Calculate total revenue from delivered orders
    const totalRevenue = deliveredOrders.reduce((acc, order) => acc + order.orderAmount, 0);

    res.render('dashboard', { orders: deliveredOrders, categories, products, totalRevenue });
  } catch (error) {
    console.log(error);
    console.log('Error rendering loadDashboard');
  }
}

// to display the users in admin dahboard
const allUsers = async (req, res) => {
  try {
    res.set('Cache-control', 'no-store');

    const regularUsers = await User.find({});
    console.log('1');

    console.log('111');
    if (req.session.updateError) {

      req.session.updateError = false
    }
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

const orderDetails = async (req, res) => {
  try {



    const orders = await Order.find({})
      .populate('userId')
      .populate('deliveryAddress')
      .populate({ path: 'orderedItem.productId', model: 'Product' }) // Populate nested field
      .sort({ _id: -1 });
    console.log('orders', orders);

    const formattedOrders = orders.map(order => {
      const date = new Date(order.createdAt)
      const formattedDate = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
      return {
        ...order.toObject(),
        formattedCreatedAt: formattedDate,
      }
    })

    res.render('orderDetails', { orderDetails: formattedOrders })

  } catch (error) {
    console.log('error loading all orders list of users');
    console.log(error);
  }
}


const singleProduct = async (req, res) => {
  try {
    console.log('starting to load single product page in admin');

    const orderId = req.query.orderId.replace(/\s+/g, '');
    console.log('orderId', orderId);

    const orderDetails = await Order.findOne({ _id: orderId })
      .populate('userId')
      .populate({ path: 'orderedItem.productId', model: 'Product' })
      .populate('deliveryAddress')


    res.render('singleProduct', { orderDetails: orderDetails })

  } catch (error) {
    console.log('error showing particular order details');
    console.log(error);
  }
}

const updateStatus = async (req, res) => {
  try {
    console.log('going to change the order status');
    const { status, orderId } = req.body; // Removed productId

console.log('status',status);
console.log('orderId',orderId);

    const orderStatus = await Order.updateOne(
      { 
        _id: orderId,
      },
      { 
        $set: { 'orderStatus': status } // Update the order status directly
      }
    );
console.log('orderStatus',orderStatus);
   
    console.log('successfully updated the order status');
    res.status(200).json({ success: true });
  } catch (error) {
    console.log('Error in updating order status:', error);
    res.status(500).json({ success: false });
  }
};



module.exports = {
  loginPage,
  verifyLogin,
  loadDashboard,
  logout,
  allUsers,
  userBlock,
  orderDetails,
  singleProduct,
  updateStatus



}