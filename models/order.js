const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.ObjectId;


const OrderSchema = mongoose.Schema({
    user:{
        type:ObjectId,
        ref:'User'
    },
    orderId:{
        type:String,
        required:true
    },
    status:{
        type:String,
        enum:['PENDING','SUCCESS', 'FAIL'],
        default:'PENDING'
    },
    paymentId:{
        type:String
    },
    paymentSignature:{
        type:String
    },
    amount:{
        type:Number,
        required:true
    }
},{
    timestamps:true
});

module.exports = mongoose.model("Order", OrderSchema);