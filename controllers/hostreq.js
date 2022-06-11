const HostReq = require("../models/hostReq");
const User = require("../models/user");
const formidable = require("formidable");
const { s3upload } = require("../utils/s3");

exports.updateHostReqStatus = async(req, res) => {
    try{
        const { userId, hostReqId, status } = req.body;
        const user = await User.findById(userId);
        console.log(user);
        if(user){
            const hostReq = await HostReq.findById(hostReqId);
            if(hostReq){
                hostReq.status=status;
                await hostReq.save();
                if(status==="VERIFIED"){
                    user.role =1;
                }
                await user.save();
                return res.status(200).json({
                    message:'Verified Successfully'
                })
            }else{
                return res.status(400).json({
                    message:'Host Request Not Found'
                })
            }
        }else{
            return res.status(400).json({
                message:'User Not Found '
            })
        }
    }catch(err){
        return res.status(400).json({
            message:'Something Went Wrong'
        })
    }
}

exports.createRequest = async(req, res) => {
    try{
        let form = new formidable.IncomingForm();
        form.keepExtensions = true;
        form.parse(req, async(err, fields, files) => {
            if(err){
                return res.status(400).json({
                    message:'Error in parsing data'
                })
            }
            const { user } = fields;
            if(!user){
                return res.status(400).json({
                    message:'User not defined'
                })
            }
            let photo;
            let id_proof;
            let electricity_bill;
            const { filepath:pfp, newFilename:pnf, mimetype:pmt } = files.photo;
            const { filepath:ipfp, newFilename:ipnf, mimetype:ipmt } = files.id_proof;
            const { filepath:epfp, newFilename:epnf, mimetype:epmt } = files.electricity_bill;
            photo = await s3upload(pfp,pnf,pmt);
            id_proof = await s3upload(ipfp,ipnf,ipmt);
            electricity_bill = await s3upload(epfp,epnf,epmt);
            const hReq =  new HostReq({
                user,
                photo,
                id_proof,
                electricity_bill
            });
            const createdHreq = await hReq.save();
            return res.status(200).json(createdHreq);
        })

    }catch(err){
        return res.status(400).json({
            message:'Something Went Wrong'
        })
    }
}

exports.canRequest = async(req, res) => {
    try{
        const { userId } = req.body;
        const hostReq = await HostReq.findOne({
            user:userId,
            $or:[{status:'PENDING'},{status:'VERIFIED'}],
        });
        if(hostReq){
            return res.status(200).json(false);
        }else{
            return res.status(200).json(true);
        }

    }catch(err){
        return res.status(400).json({
            message:'Something Went Wrong'
        })
    }
}