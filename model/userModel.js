const mongoose = require('mongoose')

const ObjectId=mongoose.Schema.Types.ObjectId

// const {use}= require('../routes/userRoute')

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        require: true
    },
    mobile: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,

    },
    is_verified: {
        type: Number,
        default: 0
    },
    password: {
        type: String,
        required: true
    },
    is_blocked: {
        type: Number,
        default: 0
    },
    token: {
        type: String,
        default: ''
    },
    dob:{
        type:String
    },
    gender:{
        type:String,
        default:false
    }


})
module.exports = mongoose.model('User', userSchema)