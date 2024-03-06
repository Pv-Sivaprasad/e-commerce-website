const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({

    productName: {
        type: String,
        required: true,
        unique: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    images:[{
        type:String,
        required:true
    }],
    categoryId:{
        type:mongoose.Schema.ObjectId,
        ref:'Category',
        required:true
    },
    is_blocked:{
        type:Boolean,
        default:false
    },
    is_categoryBlocked:{
        type:Boolean,
        default:false
    }



})
module.exports = mongoose.model('Product', productSchema)