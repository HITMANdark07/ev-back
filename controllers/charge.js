const Charge = require("../models/charge");
const Device = require("../models/device");
const User = require('../models/user');
const { errorHandler } = require('../helpers/dbErrorHandler');

const updateStatus = (deviceId, chargeId) => {
    Charge.findByIdAndUpdate(chargeId,{
        status:'CHARGED',
    }, (err, charged) => {
        if(err || !charged){
            console.log(err);
            return ;
        }
        Device.findByIdAndUpdate(deviceId,{
            inuse:false
        },(err, chargingDevice) => {
            if(err || !chargingDevice){
                console.log(err);
                return ;
            }
            console.log("device status updated");
        })
    });
}
exports.list = async(req, res) => {
    const { limit, skip} = req.query;
    const lim = parseInt(limit) || 10;
    const skp = parseInt(skip) || 0;
    let count = await Charge.countDocuments({})
    Charge.find({})
    .populate("user","name email phone")
    .populate("device","code location device_type")
    .sort({"createdAt":-1})
    .limit(lim)
    .skip(skp)
    .exec((err, chargings) => {
        if(err || !chargings){
            return res.status(400).json({
                message: errorHandler(err)
            })
        }
        res.status(200).json({
            total:count,
            chargings:chargings
        })
    })
}
exports.create = async(req, res) => {
    const {device, user,amount, time} = req.body;
    const chargeDoc = new Charge({
        device,
        user,
        amount,
        time
    });
    chargeDoc.save((err, charged) => {
        if(err || !charged){
            return res.status(400).json({
                message:errorHandler(err)
            })
        }
        Device.findByIdAndUpdate(device,{
            inuse:true
        },(err, chargingDevice) => {
            if(err || !chargingDevice){
                return res.status(400).json({
                    message:errorHandler(err)
                })
            }
            setTimeout(() => {
                updateStatus(chargingDevice._id,charged._id);
            },time);
            return res.status(200).json(charged);
        })
    })
}

exports.confirm = async(req,res) => {
    const {deviceId, userId} = req.body;
    Charge.findOne({device:deviceId, user:userId, confirm:false}).exec((err,chargingDoc) => {
        if(err || !chargingDoc){
            return res.status(400).json({
                message:errorHandler(err)
            })
        }
        chargingDoc.confirm=true;
        chargingDoc.save((err, chargConfirmed) => {
            if(err  || !chargConfirmed){
                return res.status(400).json({
                    message:errorHandler(err)
                })
            }
            User.findByIdAndUpdate(userId,{
                $inc:{balance: -chargingDoc.amount}
            },(err ,user) => {
                if(err || !user){
                    return res.status(400).json({
                        message:errorHandler(err)
                    })
                }
                return res.status(200).json({
                    status:"SUCCESS",
                    message:"Confirmed Charging"
                })
            })
        })
    })
}

exports.getAllChargingChargers = async(req, res) => {
    Charge.find({status:'CHARGING'}).exec((err, chargers) => {
        if(err || !chargers){
            return res.status(400).json({
                message:errorHandler(err)
            })
        }
        return res.status(200).json(chargers);
    })
}