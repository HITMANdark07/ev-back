const Device = require("../models/device")
const qr = require('qrcode');
const Qr = require("../models/qr");
const { errorHandler } = require('../helpers/dbErrorHandler');
const { calcDistance } = require("../utils");

exports.findDeviceById = (req,res, next, id) => {
    Device.findById(id)
    .exec((err, device) => {
        if(err || !device){
            return res.status(400).json({
                error:"Device Unavailable"
            })
        }
        req.device= device;
        next();
    })
}

exports.read = (req, res)=>{
    return res.json(req.device);
};


exports.list = (req, res) => {
    let q = {isDeleted:false};
    let qry = req.query;
    let limit = qry.limit || 10;
    let skip = qry.skip || 0;
    if(qry?.code){
        q['code'] = {
            $regex:`^${qry?.code}`,
            $options:"gi"
        }
    }
    Device.find(q)
    .sort({"createdAt":-1})
    .populate('owner', '_id name email role')
    .limit(parseInt(limit))
    .skip(parseInt(skip))
    .exec((err,devices) => {
        if(err || !devices){
            return res.status(400).json({
                message:"Unable to Fetch Devices"
            });
        }
        if(qry?.lat && qry?.lng){
            devices = devices.filter((device) => calcDistance(qry?.lat,qry?.lng,device.location.lat,device.location.lng)<15);
        }
        return res.json(devices);
    })
}

exports.listDevicesByUser = (req, res) => {
    let q = {isDeleted:false,owner:req.profile._id};
    let qry = req.query;
    let limit = qry.limit || 10;
    let skip = qry.skip || 0;
    Device.find(q)
    .sort({"createdAt":-1})
    .populate('owner', '_id name email role')
    .limit(parseInt(limit))
    .skip(parseInt(skip))
    .exec((err,devices) => {
        if(err || !devices){
            return res.status(400).json({
                message:"Unable to Fetch Devices"
            });
        }
        return res.json(devices);
    })
}

exports.create = async(req, res) => {
    const {location , owner,code,rate, privacy} = req.body;
    let data={
        code:code?.toUpperCase(),
        rate,
        location,
        owner,
        privacy
    };
    let device_exist = await Device.findOne({code:code?.toUpperCase()});
    if(device_exist){
        return res.status(400).json({
            message:"Code Already Exists"
        })
    }
    let device = new Device(data);

    device.save((err, device) => {
        if(err || !device){
            return res.status(400).json({
                message:errorHandler(err)
            })
        }
        let data = {
            deviceId: device._id
        };
        let saveData = JSON.stringify(data);
        qr.toDataURL(saveData, (err, code) => {
            if(err || !code) return res.status(400).json({
                message: "QR Generation Failed"
            })
            // console.log(code)
            let _qr = new Qr({
                device:device._id,
                code:device.code
            })
            _qr.image.data = new Buffer.from(code.split(",")[1],'base64');
            _qr.image.contentType = ((code.split(",")[0]).split(":")[1]).split(";")[0];
            // console.log(((code.split(",")[0]).split(":")[1]).split(";")[0]);
            _qr.save((err, qr) => {
                if(err || !qr){
                    return res.status(400).json({
                        message:"QR Saving Failed"
                    })
                }
                Device.findById(device._id)
                .populate('owner','_id name email role')
                .exec((err, device) => {
                    if(err || !device){
                        return res.status(400).json({
                            message: "Error in Getting device"
                        })
                    }
                    return res.status(200).json(device);
                })
                
            })
        })
    })
}

exports.update = (req, res) => {
    Device.findByIdAndUpdate(
        {_id: req.device._id},
        {$set : req.body},
        {new: true},  
    ).populate('owner',' _id name email role')
    .exec((err, device) => {
        if(err || !device){
            return res.status(400).json({
                message: errorHandler(err)
            })
        }
        return res.json(device);
    })
}

exports.toogleDevicePrivacy = async(req, res) => {
    try{
        const device = req.device;
        device.privacy = !device.privacy;
        await device.save();
        return res.status(200).json({
            message:`device privacy updated ${device.privacy ? 'private':'public'}`
        })
    }catch(err){
        return res.status(400).json({
            message:'Something went wrong'
        })
    }
}

exports.remove = (req, res) => {
    let device = req.device;
    device['isDeleted'] = true;
    device.save((err, dDevice) => {
        if(err || !dDevice){
            return res.status(400).json({
                error:"Unable to delete Device"
            })
        }
        return res.json(dDevice);
    })
}

exports.findQrByDevice = (req, res,next,id) => {
    Qr.findOne({
        device: id
    })
    .exec((err, qr) => {
        if(err || !qr){
            return res.status(400).json({
                message:'Qr not Found',
            })
        }
        req.qr = qr;
        next();
    })
}

exports.readQr = (req,res) => {
    if(req.qr.image.data){
        res.set('Content-Type', req.qr.image.contentType);
        return res.send(req.qr.image.data);
    }
}