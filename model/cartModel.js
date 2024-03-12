const mongoose=require('mongoose')


const cartSchema=new mongoose.Schema({

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    product:[
        {
            productId:{
                type:mongoose.Schema.Types.ObjectId,
                required:true,
                ref:'Product'
            },
            quantity:{
                type:Number,
                default:1
            },
            price:{
                type:Number,
                default:0
            },
            totalPrice:{
                type:Number,
                default:0
            }
        }
        
    ]
    
})

module.exports=mongoose.model('Cart',cartSchema)