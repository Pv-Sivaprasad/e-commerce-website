const mongoose=require('mongoose')
// const ObjectId=mongoose.Schema.Types.ObjectId
const { ObjectId, Timestamp } = require('mongodb');

const categorySchema=mongoose.Schema({
    categoryId:{
        type:String
    },
    catName:{
        type:String,
        required:true
    },  
    description:{
     type:String,
     required:true
    },
    is_Blocked:{
        type:Boolean,
        default:false
    },
    image:{
        type:String,
       
    },
    sold:{
        type: Number,
        default: 0
    }
 

})

module.exports=mongoose.model('Category',categorySchema)