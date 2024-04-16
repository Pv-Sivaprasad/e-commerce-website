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
}

// to load the admin dashboard
const loadDashboard = async (req, res) => {
  try {
    const deliveredOrders = await Order.find({ orderStatus: 'delivered' });
    const categories = await Category.find({});
    const products = await Product.find({});

    // Calculate total revenue from delivered orders
    const totalRevenue = deliveredOrders.reduce((acc, order) => acc + order.orderAmount, 0);
   
    const monthlyEarnings = {};
    deliveredOrders.forEach(order => {
      const now = new Date();
      const thisMonth = now.getMonth() + 1;
      const thisYear = now.getFullYear();
      if (order.createdAt.getMonth() + 1 === thisMonth && order.createdAt.getFullYear() === thisYear) {
        const monthYear = `${thisMonth}-${thisYear}`;
        if (!monthlyEarnings[monthYear]) {
          monthlyEarnings[monthYear] = 0;
        }
        monthlyEarnings[monthYear] += order.orderAmount;
      }
    });
    console.log('monthlyEarnings', monthlyEarnings);

    // Retrieve earnings for the current month
    const now = new Date();
    const currentMonthYear = `${now.getMonth() + 1}-${now.getFullYear()}`;
    const currentMonthEarnings = monthlyEarnings[currentMonthYear] || 0;

    console.log('currentMonthEarnings',currentMonthEarnings)

    res.render('dashboard', { orders: deliveredOrders, categories, products, totalRevenue, monthlyEarning: currentMonthEarnings });
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

//to show all orderd details
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

//to show single order details completely
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
    const { status, orderId } = req.body;

    console.log('status', status);
    console.log('orderId', orderId);

    // Update the order status
    const orderStatusUpdate = await Order.updateOne(
      { _id: orderId },
      { $set: { 'orderStatus': status } }
    );

    // Update the product status within the order
    const order = await Order.findById(orderId);

    console.log('order', order);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    for (const item of order.orderedItem) {
      // Update the product status based on the order status
      let productStatus = 'pending';
      switch (status) {
        case 'shipped':
          productStatus = 'shipped';
          break;
        case 'delivered':
          productStatus = 'delivered';
          break;
        case 'cancelled':
          productStatus = 'cancelled';
          break;
        case 'returned':
          productStatus = 'returned';
          break;
        default:
          break;
      }
      item.productStatus = productStatus;
    }

    // Save the updated order
    await order.save();

    console.log('successfully updated the order status and product status');
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