const Offer = require('../model/offerModel')
const Product = require('../model/productModel')
const category = require('../model/categoryModel')

const moment = require('moment')






const offerPage = async (req, res) => {
    try {

       console.log('entered offer page')
        const offers = await Offer.find({}).populate('productId').populate('categoryId');
        
        // You can format dates inside the 'offers' array directly
        const formattedOffers = offers.map(item => {
            // Assuming 'startDate' and 'endDate' fields are available in the Offer schema
            const formattedStartDate = moment(item.startDate).format('DD-MM-YYYY');
            const formattedEndDate = moment(item.endDate).format('DD-MM-YYYY');
            
            return {
                ...item.toObject(), // Convert Mongoose document to plain JavaScript object
                formattedStartDate,
                formattedEndDate,
            };
        });

        res.render('allOffer', { offers: formattedOffers });
    } catch (error) {
        console.log('Error in loading offer page:', error);
        res.status(500).send('Internal Server Error');
    }
}

const loadAddOffer=async(req,res)=>{
    try {
            console.log('entering load add offer page');

        const products=await Product.find({})

        const categories=await category.find({})

     

        res.render('addOffer',{products:products,categories:categories})
    } catch (error) {
        console.log('error in loading the add offer page');
    }
}



const addOffer = async (req, res) => {
    try {
        console.log('adding offer started');

        console.log(req.body);

        const details = req.body;
        console.log('details', details);

        const { offerName, discount, startDate, endDate, offerType, productId, categoryId } = details;

        // Check if start date is less than end date
        if (new Date(startDate) >= new Date(endDate)) {
            throw new Error('Start date must be before end date');
        }

        const offer = new Offer({
            offerName,
            discount,
            startDate,
            endDate,
            offerType,
            productId,
            categoryId
        });

        await offer.save();
        console.log('offer', offer);

        res.redirect('/admin/offer');
      
    } catch (error) {
        console.log('error in adding offer', error);
        res.status(500).send('Error adding offer: ' + error.message);
    }
}

const loadEditOffer=async(req,res)=>{
   try {
    console.log('starting to laod the edit offer page');

    const id = req.query.id
    console.log("id", id);
    
    const products=await Product.find({})

    const categories=await category.find({})

    const offer=await Offer.findOne({_id:id})

    console.log('offer',offer);
  
    res.render('editOffer',{products:products,offer:offer,categories:categories})

   } catch (error) {
    console.log('error loading edit offer page', error)
   }
}

const editOffer= async(req,res)=>{
    try {
        
        console.log('starting to edit coupon');

        const details = req.body;
        console.log('details', details);

        const id = details.id;
        console.log('id', id);

        const startDate=new Date(details.startDate)
        console.log('startDate',startDate);
        const endDate = new Date(details.endDate);
        console.log('endDate',endDate);
        if (startDate >= endDate) {
            return res.status(400).json({ error: 'Start date must be less than end date' });
        }
const updateOffer=await Offer.findByIdAndUpdate(
    { _id: id },
    { $set: details }, 
    { new: true }
)
console.log('updateOffer',updateOffer)

if(updateOffer){
    res.redirect('/admin/offer');
}else{
    console.log(' editing issue in offer');
}

    } catch (error) {
        console.log('error in editing the offer',error)
        res.status(500).send("Internal server error");
    }
}

const deleteOffer=async(req,res)=>{
    try {
        
        console.log('enetered deleting');
        const {offerId} = req.body

        const offer= await Offer.deleteOne({_id:offerId})

        if (offer.deletedCount > 0) {
            res.status(200).json({success:true})
        } else {
            res.json({ success: false })
        }
    } catch (error) {
        console.log('error in deleting the offer',error)
    }
}


module.exports = {
    offerPage,
    addOffer,
    loadAddOffer,
    deleteOffer,
    loadEditOffer,
    editOffer,
}






    
  