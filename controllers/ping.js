const Charge = require("../models/charge");
const formidable = require("formidable");
const User  = require("../models/user");
const { s3upload } = require("../utils/s3");

exports.deviceFindStatus= async(req, res) => {
    try{
        let charge = await Charge.findOne({deviceCode:req.body.code,status:'PENDING',confirm:false}).populate('device');
        if(!charge){
            return res.status(400).json({
                success:false,
                time:0
            })
        }
        return res.status(200).json({
            success:true,
            id:charge.id,
            time: charge.time-Date.now()
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
    Charge.findOne({id:id}).populate('device').exec((err,chargingDoc) => {
        if(err || !chargingDoc){
            return res.status(400).json({
                message:"Please Try Again"
            })
        }
        if(chargingDoc.time - Date.now()<0){
            return res.status(400).json({
                message:'Timeout'
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

exports.uploadToS3 = async(req, res) => {
    try{
        let form = new formidable.IncomingForm();
        form.keepExtensions = true;
        form.parse(req, (err, _, files) => {
            if(err){
                return res.status(400).json({
                    message:'Error in parsing data'
                })
            }

            const { filepath, newFilename, mimetype } = files.photo;
            s3upload(filepath,newFilename,mimetype).then((location) => {
                return res.status(200).json({
                    location: location
                })
            }).catch((err) => {
                res.status(400).json(false);
            })
        })
    }catch(err){
        res.status(400).json({
            message:'Someting went wrong'
        })
    }
}
