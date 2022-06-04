const HostReq = require("../models/hostReq");
const User = require("../models/user");

exports.updateHostReqStatus = async(req, res) => {
    try{
        const { userId, hostReqId, status } = req.body;
        const user = await User.findById(userId);
        if(user){
            const hostReq = await HostReq.findById(hostReqId);
            if(hostReq){
                hostReq.status=status;
                await hostReq.save();
                user.role =1;
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