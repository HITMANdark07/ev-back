const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.ObjectId;

const QrSchema = new mongoose.Schema({
    device:{
        type:ObjectId,
        ref:'Device',
        required:true
    },
    image:{
        data: Buffer,
        contentType:String
    }
},{timestamps:true})

module.exports = mongoose.model("Qr", QrSchema);