const mongoose=require('mongoose')
const Product = require('../model/productModel')
const Admin = require('../model/adminModel')
const User = require('../model/userModel')
const Category = require('../model/categoryModel')
const Address = require('../model/addressModel')
const fs = require('fs')
const path = require('path')
const ObjectId = mongoose.Types.ObjectId;

const loadAddressPage=async(req,res)=>{
    try {
        const id=req.session.user_id
        const user=await User.findById({_id:id})
        console.log(user);
        const address=await Address.find({userId:id})
        console.log(address);
       
        res.render('users/alladdress',{user:user,address:address})
    } catch (error) {
        console.log('error loading address page');
        console.log(error);
    }
}

const loadAddAddress=async(req,res)=>{
    try {
        const id=req.session.user_id
        const user=await User.findById({_id:id})
       

        res.render('users/addaddress',{user:user})
    } catch (error) {
        console.log('error loading the add address page');
        console.log(error);
    }
}

const addAddress = async (req, res) => {
    try {
        const details = req.body;
       

        const address = new Address({
            name: details.name,
            mobile: details.mobile,
            pincode: details.pincode,
            locality: details.locality,
            streetAddress: details.streetAddress,
            city: details.city,
            state: details.state,
            landmark: details.landmark,
            alterPhone: details.alterPhone,
            addressType: details.addressType,
            userId:req.session.user_id
        });

        const savedAddress = await address.save();

        res.redirect('/alladdress');

    } catch (error) {
        console.log('Error adding address');
        console.log(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const loadEditAddress = async (req, res) => {
    try {
       
     
        const id = req.query.id; 
      
        const user_id = req.session.user_id;
       
        const user = await User.findById({_id:user_id});
      
        const address = await Address.findById({_id:id});
       

        if (!address) {
            console.log('Address not found');
            return res.status(404).send('Address not found');
        }

        res.render('users/editaddress', { user: user, address: address });
    } catch (error) {
        console.log('Error loading edit address');
        console.log(error);
        res.status(500).send('Internal server error');
    }
};


const editAddress = async (req, res) => {
    try {
        console.log('editing start');
        const id = req.session.user_id;
        console.log('id',id);
        const user = await User.findById(id);
        console.log('user',user); 
        const _id=req.body.id
        console.log('_id',_id);
        const address=await Address.findOne({_id:_id})
        console.log('address',address);
        const details = req.body;
        console.log('details',details);

    
        const updateFields = {
            name: details.name,
            mobile: details.mobile,
            pincode: details.pincode,
            locality: details.locality,
            streetAddress: details.streetAddress,
            city: details.city,
            state: details.state,
            landmark: details.landmark,
            alterPhone: details.alterPhone,
            addressType: details.addressType
        };

       
        const updatedAddress = await Address.findByIdAndUpdate(_id, { $set: updateFields }, { new: true });

     
        // res.json({ success: true, message: 'Address updated successfully', address: updatedAddress });
        res.redirect('/alladdress')
    } catch (error) {
        console.log('Error editing address');
        console.log(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};


module.exports={
    loadAddressPage,
    loadAddAddress,
    addAddress,
    loadEditAddress,
    editAddress
    
}

