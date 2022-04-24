const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.ObjectId;


const OrderSchema = mongoose.Schema({
    user:{
        type:ObjectId,
        ref:'User'
    },
    status:{
        type:String,
        enum:['PENDING','SUCCESS', 'FAIL'],
        default:'PENDING'
    },
    amount:{
        type:Number,
        required:true
    }
},{
    timestamps:true
});

module.exports = mongoose.model("Order", OrderSchema);