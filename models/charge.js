const mongoose = require('mongoose');
const mongooseSerial = require("mongoose-serial")
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
ChargeSchema.plugin(mongooseSerial, { field:"id",prefix:new Date().getFullYear(), initCount:"monthly" , separator: "", digits:5});
module.exports = mongoose.model("Charge", ChargeSchema);