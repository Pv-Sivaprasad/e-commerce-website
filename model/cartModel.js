const mongoose=require('mongoose')


const cartSchema=new mongoose.Schema({

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    couponDiscount:{
        type:Number,
        default:0
    },
    usedUser:{
        type:Array,
        ref:'User',
        default:[]
    },
    product: {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        price: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        totalPrice: {
            type: Number,
            required: true
        }
    }
    
})

module.exports=mongoose.model('Cart',cartSchema)