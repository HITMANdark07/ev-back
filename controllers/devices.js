const Device = require("../models/device")
const qr = require('qrcode');
const Qr = require("../models/qr");

exports.findById = (req,res, next, id) => {
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
    Device.find(q)
    .sort({"createdAt":-1})
    .limit(limit)
    .skip(skip)
    .exec((err,devices) => {
        if(err || !devices){
            return res.status(400).json({
                message:"Unable to Fetch Devices"
            });
        }
        return res.json(devices);
    })
}

exports.create = (req, res) => {
    const {location , owner,code,rate} = req.body;
    let device = new Device({
        location:location,
        owner:owner,
        code: code?.toUpperCase(),
        rate:rate
    });

    device.save((err, device) => {
        if(err || !device){
            return res.status(400).json({
                message:"Failed to save Device"
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
                return res.status(200).json(device);
            })
        })
    })
}

exports.update = (req, res) => {
    Device.findByIdAndUpdate(
        {_id: req.device._id},
        {$set : req.body},
        {new: true},
        (err, device) => {
            if(err || !device){
                return res.status(400).json({
                    error: "Unable to Update Device"
                })
            }
            return res.json(device);
        }
    )
}

exports.delete = (req, res) => {
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