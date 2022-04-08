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
        enum:['CHARGING','CHARGED'],
        default:1
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
        required:true,
    }
},{
    timestamps:true
});

module.exports = mongoose.model("Charge", ChargeSChema);