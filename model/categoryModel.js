const mongoose=require('mongoose')
const ObjectId=mongoose.Schema.Types.ObjectId

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
        type:String,
        default:false
    }

})

module.exports=mongoose.model('Category',categorySchema)