const Charge = require("../models/charge");
const User  = require("../models/user");

exports.deviceFindStatus= async(req, res) => {
    try{
        let charge = await Charge.findOne({device:req.body.deviceId,status:'PENDING',confirm:false}).populate('device');
        if(!charge){
            return res.status(400).json({
                success:false,
                time:0
            })
        }
        return res.status(200).json({
            success:true,
            id:charge._id,
            time: charge.time- new Date().getTime()
        })
    }catch(err){
        return res.status(400).json({
            success:false,
            time:0
        })
    }
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
