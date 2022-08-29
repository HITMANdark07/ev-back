const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.ObjectId;


const ChargeSchema = mongoose.Schema({
    device:{
        type:ObjectId,
        ref:'Device',
    },
    deviceCode:{
        type:String,
        required:true
    },
    id:{
        type:String
    },
    user:{
        type:ObjectId,
        ref:'User'
    },
    status:{
        type:String,
        enum:['PENDING','CHARGING','CHARGED','CANCELED','FAILED'],
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
    powerUsed:{
        type:Number,
    }
},{
    timestamps:true
});

module.exports = mongoose.model("Charge", ChargeSchema);