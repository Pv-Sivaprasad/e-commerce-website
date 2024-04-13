const Coupon=require('../model/couponModel')

const Cart=require('../model/cartModel')

const moment=require('moment')


/// to load the coupon page
const couponPage=async(req,res)=>{
    try {
        
        const totalCoupons=await Coupon.countDocuments()


        const coupons=await Coupon.find({}).sort({_id:-1})

        const formattedCoupon = coupons.map(item => {
            const formattedDate = moment(item.expireDate).format('DD-MM-YYYY');
            return {
                ...item.toObject(),
                formattedDate,
            };
        });


        res.render('couponPage',{coupons:formattedCoupon})

    } catch (error) {
        console.log('error loading coupon page',error);
    }
}

//to load the add copon page
const loadAddCoupon=async(req,res)=>{
    try {
        res.render('addCoupon')
        
    } catch (error) {
        console.log('error loadingpage of addinf coupon',error);
    }
}

// to add a coupon
const addCoupon = async (req, res) => {
    try {
        console.log('adding coupon started');
        console.log(req.body);
        const details = req.body;
        console.log('details', details);

        // Validate expiry date format
        const expiryDate = new Date(details.expiryDate);
        if (isNaN(expiryDate.getTime())) {
            // Invalid date format
            return res.status(400).render('addCoupon',{errorMessage:"Invalid expiry date format"})
        }

        // Check if expiry date is in the future
        const currentDate = new Date();
        if (expiryDate <= currentDate) {
            return res.status(400).render('addCoupon',{errorMessage:"Expiry date must be in the future"})
        }

        const coupon = new Coupon({
            couponCode: details.couponCode,
            discountAmount: details.discountAmount,
            minimumAmount: details.minimumAmount,
            description: details.description,
            expireDate: expiryDate // Use validated expiry date
        });

        await coupon.save();
        console.log('coupon', coupon);
        if (coupon) {
            res.redirect('/admin/coupon');
        } else {
            console.log('no coupon for you');
        }
    } catch (error) {
        console.log('error in adding coupon:', error);
        res.status(500).send("Internal server error");
    }
};

// to load the  edit  coupon
const loadEditCoupon=async(req,res)=>{
    try {
        console.log('starting to laod the edit coupon page');
        const id = req.query.id
        console.log("id", id);

        const couponData= await Coupon.findOne({_id:id})
        console.log('couponData',couponData);

        res.render('editCoupon',{coupons:couponData})

    } catch (error) {
        console.log('error in loading  edit coupon page ',error);
    }
}

// to edit the selected coupon
const editCoupon = async (req, res) => {
    try {
        console.log('starting to edit the coupon');

        const details = req.body;
        console.log('details', details);

        const id = details.id;
        console.log('id', id);

        // Validate expiry date format
        const expiryDate = new Date(details.expireDate);
        if (isNaN(expiryDate.getTime())) {
            // Invalid date format
            return res.status(400).render('editCoupon', { errorMessage: "Invalid expiry date format" });
        }

        // Check if expiry date is in the future
        const currentDate = new Date();
        if (expiryDate <= currentDate) {
            return res.status(400).render('editCoupon', { errorMessage: "Expiry date must be in the future" });
        }

        const couponData = await Coupon.findByIdAndUpdate(
            { _id: id },
            { $set: details }, // Use modified details object
            { new: true }
        );

        console.log('couponData', couponData);

        if (couponData) {
            res.redirect('/admin/coupon');
        } else {
            console.log('no coupon for you');
        }
    } catch (error) {
        console.log('error in editing coupon', error);
        res.status(500).send("Internal server error");
    }
};

// to delete the specific coupon
const deleteCoupon=async(req,res)=>{
    try {
        console.log('enetered deleting');
        const {couponId} = req.body

        const coupon= await Coupon.deleteOne({_id:couponId})
       
        console.log('coupon',coupon);
       
        if (coupon.deletedCount > 0) {
            res.status(200).json({success:true})
        } else {
            res.json({ success: false })
        }
    } catch (error) {
        console.log('error deleting the coupon',error);
    }
}



const verifyCoupon = async (req, res) => {
    console.log('entered verifying coupon entered by the user');

    const userId = req.session.user_id;

    console.log('userId', userId);

    const cart = await Cart.findOne({ userId: userId });

    console.log('cart', cart);

    const { couponCode } = req.body;

    console.log(`CouponCode: ${couponCode}`);

    const couponData = await Coupon.findOne({ couponCode: couponCode });

    console.log('couponData:', couponData);



    if (couponData) {

        req.session.couponAmount = couponData.discountAmount;

        console.log('req.session.couponAmount',req.session.couponAmount)
        const cartResult = await Cart.findOneAndUpdate(
            { userId: userId },
            {
                $set: {
                    couponDiscount: couponData.discountAmount,
                    'product.totalPrice': cart.product.totalPrice - couponData.discountAmount
                }
            },
            { new: true }
        );
        console.log('cartResult', cartResult);
        res.json({ cartResult });
    } else {
        // Coupon not found
        res.status(404).json({ error: 'Coupon not found' });
    }
};


const removeCoupon = async (req, res) => {

    console.log('starting');
    const userId = req.session.user_id;

    console.log('userId',userId);

    console.log('entering to remove the coupon');

    try {
       
        console.log('eneterd the try block');
        const cart = await Cart.findOne({ userId: userId });

        console.log('cart in remove',cart);
       
        if (cart) {
          
           

           
            cart.product.totalPrice = cart.product.totalPrice + cart.couponDiscount;
            
            cart.couponDiscount = 0;
       
            const updatedCart = await cart.save();

       
            return res.json({ success: true, cart: updatedCart });
        } else {
        
            return res.status(404).json({ success: false, message: "Cart not found for the user" });
        }
    } catch (error) {
      
        console.error("Error removing coupon:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}


module.exports={
    couponPage,
    loadAddCoupon,
    addCoupon,
    loadEditCoupon,
    editCoupon,
    deleteCoupon,
    verifyCoupon,
    removeCoupon,
}