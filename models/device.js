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
    },
    private:{
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
    code:{
        type:String,
        trim:true,
        required:true,
        unique:true,
    },
    rate:{
        type:Number,
        default:0
    }
},{
    timestamps:true
});

module.exports = mongoose.model("Device", DeviceSchema);