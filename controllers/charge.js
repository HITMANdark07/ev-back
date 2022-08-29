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


const updateStatus = (deviceId, chargeId, time) => {
    let timer1 = setTimeout(async () => {
        Charge.findByIdAndUpdate(chargeId, {
            status: 'CHARGED',
        }, (err, charged) => {
            if (err || !charged) {
                console.log(err);
                return;
            }
            Device.findByIdAndUpdate(deviceId, {
                inuse: false
            }, (err, chargingDevice) => {
                if (err || !chargingDevice) {
                    console.log(err);
                    return;
                }
                console.log("device status updated");
            })
        });
    }, time)
    setTimeout(async () => {
        let device = await Device.findById(deviceId)
        let chrg = await Charge.findById(chargeId);
        if (device.inuse && chrg.status === 'PENDING') {
            chrg.status = 'FAILED';
            device.inuse = false;
            await device.save();
            await chrg.save();
            clearTimeout(timer1)
        }
    }, 120000);

}

exports.chargesByDevice = async (req, res) => {
    const deviceId = req.device._id;
    const { limit, skip } = req.query;
    const lim = parseInt(limit) || 10;
    const skp = parseInt(skip) || 0;
    try {
        const charges = await Charge.find({ device: deviceId })
            .populate("user", "name email phone")
            .populate("device", "code location device_type")
            .sort({ "createdAt": -1 })
            .limit(lim)
            .skip(skp);

        res.status(200).json(charges);
    } catch (err) {
        res.status(400).json({
            message: errorHandler(err)
        })
    }
}
exports.list = async (req, res) => {
    const { limit, skip } = req.query;
    const lim = parseInt(limit) || 10;
    const skp = parseInt(skip) || 0;
    let count = await Charge.countDocuments({})
    Charge.find({})
        .populate("user", "name email phone")
        .populate("device", "code location device_type")
        .sort({ "createdAt": -1 })
        .limit(lim)
        .skip(skp)
        .exec((err, chargings) => {
            if (err || !chargings) {
                return res.status(400).json({
                    message: errorHandler(err)
                })
            }
            res.status(200).json({
                total: count,
                chargings: chargings
            })
        })
}

exports.listChargeByUser = async (req, res) => {
    const { limit, skip } = req.query;
    const lim = parseInt(limit) || 10;
    const skp = parseInt(skip) || 0;
    let count = await Charge.countDocuments({ user: req.profile._id })
    Charge.find({ user: req.profile._id })
        .populate("user", "name email phone")
        .populate("device", "code location device_type")
        .sort({ "createdAt": -1 })
        .limit(lim)
        .skip(skp)
        .exec((err, chargings) => {
            if (err || !chargings) {
                return res.status(400).json({
                    message: errorHandler(err)
                })
            }
            res.status(200).json({
                total: count,
                chargings: chargings
            })
        })
}
exports.sendMessage = async (req, res) => {
    const { device, chargeId } = req.body;
    const dvc = await Device.findById(device);
    if (!dvc.gsm) {
        return res.status(400).json({
            message: 'Device is not of type GSM'
        })
    }
    let msgBody = chargeId;
    //twilio send Sms
    client.messages
        .create({
            body: msgBody,
            from: phoneNumber, to: `+91${dvc.gsm}`
        })
        .then((response) => {
            return res.status(200).json({
                message: `OTP Sent Success`,
                success: true,
            })
        }).catch((err) => {
            return res.status(400).json({
                message: `OTP Sending Failed`,
                success: false,
            })
        })
}

exports.create = async (req, res) => {
    const { device, user, time, email } = req.body;
    const dvc = await Device.findById(device).populate("owner");
    let member = false;
    if (dvc?.privacy) {
        if (dvc?.members.includes(email) || dvc.owner?.email == email) {
            member = true;
        } else {
            return res.status(400).json({
                message: 'This is a private device'
            })
        }
    }
    let amount = member ? 0 : Number((Number((Number(time) / 60000)/60) * dvc.rate).toFixed(2));
    const alreadyReq = await Charge.findOne({
        device: device, user: user, $or: [
            { status: 'PENDING' },
            { status: 'CHARGING' }
        ]
    });
    if (alreadyReq) {
        return res.status(400).json({
            message: "Already a request is pending"
        })
    }
    const chargesCount = await Charge.countDocuments({});
    const sequence = String(new Date().getFullYear()) + String(10 ** 6 + chargesCount + 1);
    const chargeDoc = new Charge({
        device,
        user,
        amount,
        deviceCode: dvc.code,
        id: sequence,
        time: new Date(Date.now() + time)
    });
    chargeDoc.save((err, charged) => {
        if (err || !charged) {
            console.log(err)
            return res.status(400).json({
                message: errorHandler(err)
            })
        }
        Device.findByIdAndUpdate(device, {
            inuse: true
        }, (err, chargingDevice) => {
            if (err || !chargingDevice) {
                return res.status(400).json({
                    message: errorHandler(err)
                })
            }
            updateStatus(chargingDevice._id, charged._id, time);

            return res.status(200).json(charged);
        })
    })
}

exports.updatePower = async(req, res) => {
    try{
        const { id , power  } = req.body;
        const charge = await Charge.findOne({id});
        if(charge){
            charge.powerUsed = power;
            await charge.save();
            return res.status(200).json(true);
        }else{
            return res.status(400).json({
                message:'Not a valid id'
            })
        }
    }catch(err){
        return res.status(400).json({
            message:err
        })
    }
}

// exports.confirm = async(req,res) => {
//     const {id} = req.body;
//     Charge.findById(id).populate('device').exec((err,chargingDoc) => {
//         if(err || !chargingDoc){
//             return res.status(400).json({
//                 message:"Please Try Again"
//             })
//         }
//         if(chargingDoc.confirm==true){
//             return res.status(400).json({
//                 message:"Already Confirmed"
//             })
//         }
//         chargingDoc.confirm=true;
//         chargingDoc.status="CHARGING"
//         chargingDoc.save((err, chargConfirmed) => {
//             if(err  || !chargConfirmed){
//                 return res.status(400).json({
//                     message:errorHandler(err)
//                 })
//             }
//             User.findByIdAndUpdate(chargingDoc.user,{
//                 $inc:{balance: -chargingDoc.amount}
//             },(err ,user) => {
//                 if(err || !user){
//                     return res.status(400).json({
//                         message:errorHandler(err)
//                     })
//                 }
//                 User.findByIdAndUpdate(chargingDoc.device.owner,{
//                     $inc:{balance: Number(chargingDoc.amount)*0.8}
//                 },(err, owner) => {
//                     if(err || !owner){
//                         return res.status(400).json({
//                             message:errorHandler(err)
//                         })
//                     }
//                     return res.status(200).json(chargingDoc.time - Date.now())
//                 })
//             })
//         })
//     })
// }

// exports.deviceFindStatus= async(req, res) => {
//     try{
//         let charge = await Charge.findOne({device:req.params.deviceId,status:'PENDING',confirm:false}).populate('device');
//         if(!charge){
//             return res.status(400).json({
//                 success:false,
//                 time:0
//             })
//         }
//         return res.status(200).json({
//             success:true,
//             id:charge._id,
//             time: charge.time- new Date().getTime()
//         })
//     }catch(err){
//         return res.status(400).json({
//             success:false,
//             time:0
//         })
//     }
// }

exports.isConfirm = async (req, res) => {
    try {
        let charge = await Charge.findById(req.params.chargeId);
        if (charge.confirm) {
            let remainingTime = charge.time - Date.now();
            if (remainingTime > 0) return res.status(200).json(remainingTime);
            else return res.status(200).json(0);
        }
        return res.status(400).json(false);
    } catch (err) {
        return res.status(400).json({
            message: 'Something Went Wrong'
        });
    }
}

exports.getAllChargingChargers = async (req, res) => {
    Charge.find({ status: 'CHARGING' }).exec((err, chargers) => {
        if (err || !chargers) {
            return res.status(400).json({
                message: errorHandler(err)
            })
        }
        return res.status(200).json(chargers);
    })
}

exports.getChargeById = async (req, res, next, id) => {
    try {
        const charge = await Charge.findById(id);
        req.charge = charge;
        next();
    } catch (err) {
        return res.status(400).json({
            message: 'Charge not Found'
        })
    }
}

exports.cancelChargeById = async (req, res) => {
    try {
        let charge = req.charge;
        charge.status = 'CANCELED';
        if (charge.time - (Date.now()) > 0) {
            let updatedCharge = await charge.save();
            await Device.findByIdAndUpdate(charge.device, {
                inuse: false
            }, { new: true });
            return res.status(200).json(updatedCharge);
        } else {
            return res.status(400).json({
                message: 'Already Charged'
            })
        }

    } catch (err) {
        return res.status(400).json({
            message: 'Unable to cancel your request'
        })
    }
}

exports.isChargeCanceled = async (req, res) => {
    if (req.charge.status === 'CANCELED' && (req.charge.time - (new Date(req.charge.createdAt).getTime()))) {
        return res.status(200).json(true);
    } else {
        return res.status(400).json(false);
    }
}