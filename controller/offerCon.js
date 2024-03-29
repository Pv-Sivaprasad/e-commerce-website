const Offer = require('../model/offerModel')
const Product = require('../model/productModel')
const category = require('../model/categoryModel')

const moment = require('moment')






const offerPage = async (req, res) => {
    try {
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

        const products=await Product.find({})

        const categories=await category.find({})

       

        res.render('addOffer',{products:products,categories:categories})
    } catch (error) {
        console.log('error in loading the add offer page');
    }
}


const addOffer = async (req, res) => {
    try {

       console.log('adding offer  started');

       console.log(req.body);

       const details=req.body
       console.log('details',details);

       const offer=new Offer({

        offerName:details.offerName,
        discount:details.discount,
        startDate:details.startDate,
        endDate:details.endDate,
        offerType:details.offerType,
        productId:details.productId,
        categoryId:details.categoryId
       })

        await offer.save()
        console.log('offer',offer);
        if(offer){
            res.redirect('/admin/offer')
        }else{
            console.log('no coupon for you');
        }

      
    } catch (error) {
        console.log('errorn in adding offer', error);
    }
}
module.exports = {
    offerPage,
    addOffer,
    loadAddOffer,
}






    
  