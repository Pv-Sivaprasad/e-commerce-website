const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

// Define schema for address
const addressSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    mobile: {
        type: String, 
        required: true
    },
    pincode: {
        type: String, 
        required: true
    },
    locality: {
        type: String,
        required: true
    },
    streetAddress: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    landmark: String,
    alterPhone: String,  
    addressType: {
        type: String,
        required: true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,  
        ref:"User",
        required:true

    }
    
});


const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
