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
    code:{
        type:String,
        trim:true,
        required:true,
        unique:true,
    },
    location:LocationSchema,
    owner:{
        type:ObjectId,
        ref:'User',
        required:true
    },
    isDeleted:{
        type:Boolean,
        default:false
    },
    privacy:{
        type:Boolean,
        default:false
    },
    status:{
        type:Number,
        enum:[1,0],
        default:1
    },
    inuse:{
        type:Boolean,
        default:false
    },
    members:[],
    rate:{
        type:Number,
        default:0
    }
},{
    timestamps:true
});

module.exports = mongoose.model("Device", DeviceSchema);