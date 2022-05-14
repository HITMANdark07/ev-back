const Charge = require("../models/charge");
const Device = require("../models/device");
const User = require('../models/user');
const { errorHandler } = require('../helpers/dbErrorHandler');
const device = require("../models/device");

// Twilio Credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const phoneNumber = process.env.TWILIO_NUMBER;
const client = require('twilio')(accountSid, authToken);


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

exports.listChargeByUser = async(req, res) => {
    const { limit, skip} = req.query;
    const lim = parseInt(limit) || 10;
    const skp = parseInt(skip) || 0;
    let count = await Charge.countDocuments({user:req.profile._id})
    Charge.find({user:req.profile._id})
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
exports.sendMessage = async(req, res) => {
    const { device,chargeId} = req.body;
    const dvc = await Device.findById(device);
    if(!dvc.gsm){
        return res.status(400).json({
            message:'Device is not of type GSM'
        })
    }
    let msgBody = chargeId ;
    //twilio send Sms
    client.messages
    .create({body: `OrderId: 12 \n Thank You for Shopping...`, 
    from: phoneNumber, to: `+91${dvc.gsm}`})
    .then((response) => {
        return res.status(200).json({
            message:`OTP Sent Success`,
            success:true,
        })
    }).catch((err) => {
        return res.status(400).json({
            message: `OTP Sending Failed`,
            success:false,
        })
    })

}
exports.create = async(req, res) => {
    const {device, user, time} = req.body;
    const dvc = await Device.findById(device);
    let amount = Number(((Number(time)/60000)*dvc.rate).toFixed(2));
    const alreadyReq = await Charge.findOne({device:device,user:user,status:'CHARGING'});
    if(alreadyReq){
        return res.status(400).json({
            message:"Already a request is pending"
        })
    }
    const chargeDoc = new Charge({
        device,
        user,
        amount,
        time: new Date(Date.now()+time)
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
    const {id} = req.body;
    Charge.findById(id).populate('device').exec((err,chargingDoc) => {
        if(err || !chargingDoc){
            return res.status(400).json({
                message:"Please Try Again"
            })
        }
        if(chargingDoc.confirm==true){
            return res.status(400).json({
                message:"Already Confirmed"
            })
        }
        chargingDoc.confirm=true;
        chargingDoc.status="CHARGING"
        chargingDoc.save((err, chargConfirmed) => {
            if(err  || !chargConfirmed){
                return res.status(400).json({
                    message:errorHandler(err)
                })
            }
            User.findByIdAndUpdate(chargingDoc.user,{
                $inc:{balance: -chargingDoc.amount}
            },(err ,user) => {
                if(err || !user){
                    return res.status(400).json({
                        message:errorHandler(err)
                    })
                }
                User.findByIdAndUpdate(chargingDoc.device.owner,{
                    $inc:{balance: Number(chargingDoc.amount)*0.8}
                },(err, owner) => {
                    if(err || !owner){
                        return res.status(400).json({
                            message:errorHandler(err)
                        })
                    }
                    return res.status(200).json(chargingDoc.time - Date.now())
                })
            })
        })
    })
}

exports.isConfirm = async(req, res) => {
    try{
        let charge = await Charge.findById(req.params.chargeId);
        if(charge.confirm){
            return res.status(200).json(true);
        }
        return res.status(400).json(false);
    }catch(err){
        return res.status(400).json({
            message: 'Something Went Wrong'
        });
    }

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