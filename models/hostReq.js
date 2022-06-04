const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.ObjectId;


const HostReqSchema = mongoose.Schema({
    user:{
        type:ObjectId,
        ref:'User'
    },
    status:{
        type:String,
        enum:['PENDING','VERIFIED', 'REJECTED'],
        default:'PENDING'
    },
    photo:{
        type:String,
        required:true
    }
},{
    timestamps:true
});

module.exports = mongoose.model("HostReq", HostReqSchema);