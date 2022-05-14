const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.ObjectId;


const ChargeSChema = mongoose.Schema({
    device:{
        type:ObjectId,
        ref:'Device',
    },
    user:{
        type:ObjectId,
        ref:'User'
    },
    status:{
        type:String,
        enum:['PENDING','CHARGING','CHARGED','FAILED'],
        default:'PENDING'
    },
    confirm:{
        type:Boolean,
        default:false
    },
    amount:{
        type:Number,
        required:true
    },
    time:{
        type:Number,
        default:0
    },
    // powerUsed:{
    //     type:Number,
    // }
},{
    timestamps:true
});

module.exports = mongoose.model("Charge", ChargeSChema);