const Offer = require('../model/offerModel')
const Product = require('../model/productModel')
const category = require('../model/categoryModel')

const moment = require('moment')



//admin side offer page loading
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

// admin side add offer page rendering
const loadAddOffer = async (req, res) => {
    try {
        console.log('entering load add offer page');

        const products = await Product.find({})

        const categories = await category.find({})


        res.render('addOffer', { products: products, categories: categories })
    } catch (error) {
        console.log('error in loading the add offer page');
    }
}

// to add offer by admin
const addOffer = async (req, res) => {
    try {
        console.log('adding offer started');

        console.log(req.body);

        const details = req.body;
        console.log('details', details);
  
        const { offerName, discount, startDate, endDate, offerType, productId, categoryId } = details;

       console.log('catogoryId',categoryId)

        // Check if start date is less than end date
        if (new Date(startDate) >= new Date(endDate)) {
            throw new Error('Start date must be before end date');
        }
        const newOffer = new Offer({
            offerName,
            discount,
            startDate,
            endDate,
            offerType,
           
        }); 
        console.log('reached here') 
        console.log('offer',newOffer)

        if (offerType === 'Product') {
            console.log('going with ptoduct offer');
            newOffer.productId=productId
            console.log('offer.productId',newOffer.productId)
            const proData= await Product.findOne({_id:productId})
            console.log('proData',proData)
              await Product.findByIdAndUpdate(
                {_id:productId},
            
                {$set:{
                    productOfferId:newOffer._id,
                    productDiscount:discount,
                    price:proData.price-discount
                }}
            )
        }
       
        else if (offerType === 'Category') {
            console.log('going with category offer');
            newOffer.categoryId = categoryId; // Assuming category is the ObjectId of the category
            console.log(' newOffer.categoryId', newOffer.categoryId)
            try {
                const catProducts = await Product.find({ categoryId: categoryId });
                console.log('catProducts', catProducts);
                for (const product of catProducts) {
                    await Product.findOneAndUpdate(
                        { _id: product._id },
                        {
                            $set: {
                                categoryOfferId: newOffer._id,
                                categoryDiscount: discount,
                                price: product.price - discount
                            }
                        }
                    );
                }
            } catch (error) {
                console.error('Error updating products:', error);
            }
        }
       
        const updatedProduct=    await newOffer.save();

        console.log('updatedProduct', updatedProduct);

        res.redirect('/admin/offer');

    } catch (error) {
        console.log('error in adding offer', error);
        res.status(500).send('Error adding offer: ' + error.message);
    }
}

//to load the edit offer page
const loadEditOffer = async (req, res) => {
    try {
        console.log('starting to laod the edit offer page');

        const id = req.query.id
        console.log("id", id);

        const products = await Product.find({})

        const categories = await category.find({})

        const offer = await Offer.findOne({ _id: id })

        console.log('offer', offer);

        res.render('editOffer', { products: products, offer: offer, categories: categories })

    } catch (error) {
        console.log('error loading edit offer page', error)
    }
}

//to  edit the offer
const editOffer = async (req, res) => {
    try {

        console.log('starting to edit coupon');

        const details = req.body;
        console.log('details', details);

        const id = details.id;
        console.log('id', id);

        const startDate = new Date(details.startDate)
        console.log('startDate', startDate);
        const endDate = new Date(details.endDate);
        console.log('endDate', endDate);
        if (startDate >= endDate) {
            return res.status(400).json({ error: 'Start date must be less than end date' });
        }
        const updateOffer = await Offer.findByIdAndUpdate(
            { _id: id },
            { $set: details },
            { new: true }
        )
        console.log('updateOffer', updateOffer)

        if (updateOffer) {
            res.redirect('/admin/offer');
        } else {
            console.log(' editing issue in offer');
        }

    } catch (error) {
        console.log('error in editing the offer', error)
        res.status(500).send("Internal server error");
    }
}

//to delete the offer
// const deleteOffer = async (req, res) => {
//     try {

//         console.log('enetered deleting');
//         const { offerId } = req.body

//         const offer = await Offer.deleteOne({ _id: offerId })

//         if (offer.deletedCount > 0) {
//             res.status(200).json({ success: true })
//         } else {
//             res.json({ success: false })
//         }
//     } catch (error) {
//         console.log('error in deleting the offer', error)
//     }
// }
const deleteOffer = async (req, res) => {
    try {
        console.log('entered deleting');
        const { offerId } = req.body;

        // Find the offer to delete
        const offer = await Offer.findById(offerId);

        if (!offer) {
            return res.status(404).json({ success: false, message: "Offer not found" });
        }

        // Check if offer type is Product or Category
        if (offer.offerType === 'Product') {
            // If offer is for a product, update the product
            await Product.findOneAndUpdate(
                { _id: offer.productId },
                {
                    $unset: {
                        productOfferId: 1, // Remove the reference to offer
                        productDiscount: 1, // Remove the discount
                    },
                    $inc: { price: offer.discount } // Increase price by the amount of discount
                }
            );
        } else if (offer.offerType === 'Category') {
            // If offer is for a category, update all products in that category
            const catProducts = await Product.find({ categoryId: offer.categoryId });
            for (const product of catProducts) {
                await Product.findOneAndUpdate(
                    { _id: product._id },
                    {
                        $unset: {
                            categoryOfferId: 1, // Remove the reference to offer
                            categoryDiscount: 1, // Remove the discount
                        },
                        $inc: { price: offer.discount } // Increase price by the amount of discount
                    }
                );
            }
        }

        // Delete the offer from the database
        await Offer.deleteOne({ _id: offerId });

        res.status(200).json({ success: true, message: "Offer deleted successfully" });
    } catch (error) {
        console.log('error in deleting the offer', error);
        res.status(500).json({ success: false, message: "Error deleting offer: " + error.message });
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







