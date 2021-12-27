const mongoose = require('mongoose');

const userSchema =  new mongoose.Schema({
    name:{
        type:String,
        trim:true,
        required:true,
        maxlength:32
    },
    activated:{
        type:Number,
        default:1,
        emun:[0,1]
    },
    balance:{
        type:Number,
        default:0.00
    },
    email:{
        type:String,
        required:true,
        trim:true,
        unique:true
    },
    photo:{
        type:String,
        required:true,
    },
    role:{
        type:Number,
        enum:[0,1],
        default:0
    },
    verified:{
        type:Number,
        enum:[0,1],
        default:0,
    }
},{ timestamps:true });

module.exports = mongoose.model('User', userSchema);