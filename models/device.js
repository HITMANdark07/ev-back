const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.ObjectId;

const LocationSchema = mongoose.Schema({
    lat:{
        type:Number,
        required:true
    },
    lng:{
        type:Number,
        required:true
    }
},{ timestamps: true});

const DeviceSchema = mongoose.Schema({
    location:LocationSchema,
    owner:{
        type:ObjectId,
        ref:'User',
    },
    isDeleted:{
        type:Boolean,
        default:false
    }
},{
    timestamps:true
});

module.exports = mongoose.model("Device", DeviceSchema);