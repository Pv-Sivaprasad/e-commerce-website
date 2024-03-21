const Offer=require('../model/offerModel')
const Product=require('../model/productModel')
const category=require('../model/categoryModel')






const offerPage=async(req,res)=>{
    try {
        
        const offers=await Offer.countDocuments({})

res.render('allOffer')
    } catch (error) {
        console.log('error in loading offer page',error);
    }
}

const addOffer=async(req,res)=>{
    try {

        const products=await Product.find({})
        const categories=await category.find({})


        res.render('addOffer',{products:products,categories:categories})
    } catch (error) {
        console.log('errorn in adding offer',error);
    }
}
module.exports={
    offerPage,
    addOffer,
}


{/* <div class="container">
    <form action="addoffer" method="POST">
        <div class="row">
            <div class="col-md-6">
                <div class="mb-3">
                    <label for="offerName" class="form-label">Offer Name</label>
                    <input type="text" class="form-control" name="offerName" required>
                </div>
            </div>
            <div class="col-md-6">
                <div class="mb-3">
                    <label for="discount" class="form-label">Discount</label>
                    <input type="number" class="form-control" name="discount" required>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-6">
                <div class="mb-3">
                    <label for="startDate" class="form-label">Start Date</label>
                    <input type="date" class="form-control" name="startDate">
                </div>
            </div>
            <div class="col-md-6">
                <div class="mb-3">
                    <label for="endDate" class="form-label">End Date</label>
                    <input type="date" class="form-control" name="endDate">
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-6">
                <div class="mb-3">
                    <label for="offerType" class="form-label">Offer Type</label>
                    <select class="form-select" name="offerType" required>
                        <option value="category">Category</option>
                        <option value="product">Product</option>
                        <option value="referral">Referral</option>
                    </select>
                </div>
            </div>
            <div class="col-md-6">
                <div class="mb-3">
                    <label for="productId" class="form-label">Product ID</label>
                    <input type="text" class="form-control" name="productId">
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-6">
                <div class="mb-3">
                    <label for="categoryId" class="form-label">Category ID</label>
                    <input type="text" class="form-control" name="categoryId">
                </div>
            </div>
        </div>
        <button type="submit" class="btn btn-primary">Add Offer</button>
    </form>
</div>




    // Client-side validation
    document.addEventListener('DOMContentLoaded', function() {
        const form = document.querySelector('form');

        form.addEventListener('submit', function(event) {
            const startDateInput = document.querySelector('#startDate');
            const endDateInput = document.querySelector('#endDate');

            const startDate = new Date(startDateInput.value);
            const endDate = new Date(endDateInput.value);

           
            if (startDate >= endDate) {
                alert('Start date must be before end date');
                event.preventDefault(); 
            }
        });
    });


const express = require('express');
const router = express.Router();

router.post('/addoffer', function(req, res) {
    const { offerName, discount, startDate, endDate, offerType, productId, categoryId } = req.body;


    if (!offerName || !discount || !startDate || !endDate || !offerType) {
        return res.status(400).json({ message: 'All fields are required' });
    }

  
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

  
    if (startDateObj >= endDateObj) {
        return res.status(400).json({ message: 'Start date must be before end date' });
    }

   
    res.status(200).json({ message: 'Offer added successfully' });
});

module.exports = router; */}
