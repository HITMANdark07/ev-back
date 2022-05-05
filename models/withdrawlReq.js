const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.ObjectId;


const WithdrawlRequestSchema = mongoose.Schema({
    user:{
        type:ObjectId,
        ref:'User'
    },
    status:{
        type:String,
        enum:['PENDING','SUCCESS', 'FAIL'],
        default:'PENDING'
    },
    bankName:{
        type:String,
    },
    accountNumber:{
        type:String,
    },
    ifsc:{
        type:String
    },
    upiId:{
        type:String
    },
    amount:{
        type:Number,
        required:true
    }
},{
    timestamps:true
});

module.exports = mongoose.model("WithdrawlRequest", WithdrawlRequestSchema);