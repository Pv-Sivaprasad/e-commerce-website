const Coupon=require('../model/couponModel')

const moment=require('moment')






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


const loadAddCoupon=async(req,res)=>{
    try {
        res.render('addCoupon')
        
    } catch (error) {
        console.log('error loadingpage of addinf coupon',error);
    }
}

const addCoupon=async(req,res)=>{
    try {
        console.log('adding coupon started');

        console.log(req.body);
        const details=req.body
        console.log('details',details);


        const coupon=new Coupon({
            couponCode: details.couponCode,
            discountAmount:details.discountAmount,
            minimumAmount:details.minimumAmount,
            description:details.description,
            expireDate:details.expiryDate
        })
            await coupon.save()
        console.log('coupon',coupon);
            if(coupon){
                res.redirect('/admin/coupon')
            }else{
                console.log('no coupon for you');
            }
    } catch (error) {
        console.log('error in adding coupon');        
    }
}


const loadEditCoupon=async(req,res)=>{
    try {
        console.log('starting to laod the edit coupon page');
        const id = req.query.id
        console.log("id", id);

        const couponData= await Coupon.findOne({_id:id})

        res.render('editCoupon',{coupons:couponData})

    } catch (error) {
        console.log('error in loading  edit coupon page ',error);
    }
}

const editCoupon= async(req,res)=>{
    try {
        console.log('starting to edit the coupon');

        const details=req.body;

        console.log('details',details);

        const id=details.id

        console.log('id',id);

        const couponData=await Coupon.findByIdAndUpdate(
            { _id: id },
            { $set: details }, // Use modified details object
            { new: true }
        );
        console.log('couponData',couponData);

        if(couponData){
            res.redirect('/admin/coupon')
        }else{
            console.log('no coupon for you');
        }
    } catch (error) {
        console.log('error in editing coupon',error);
    }
}

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
module.exports={
    couponPage,
    loadAddCoupon,
    addCoupon,
    loadEditCoupon,
    editCoupon,
    deleteCoupon
}