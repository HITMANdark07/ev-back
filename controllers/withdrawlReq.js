const WithdrawlRequest = require("../models/withdrawlReq");
const User = require('../models/user');
const { errorHandler } = require('../helpers/dbErrorHandler');


exports.findReqById = (req, res, next, id) => {
    WithdrawlRequest.findById(id).exec((err, WReq) => {
        if(err || !WReq){
            return res.status(400).json({
                error: "WithdrwalRequest Not Found"
            })
        }
        req.WReq = WReq;
        next();
    })
}

exports.create = async(req , res) => {
    const {user} = req.body;
    const prevRequest = await WithdrawlRequest.findOne({user:user,status:'PENDING'});
    const usr = await User.findById(user);
    if(!usr){
        return res.status(400).json({
            message:'User not Found'
        })
    }
    if(prevRequest){
        return res.status(400).json({
            message: "Previous Request is still Pending"
        })
    }
    const withReq = new WithdrawlRequest({
        ...req.body,
        amount:usr.balance
    });
    const response = await withReq.save();

    return res.status(200).json(response);
}

exports.list = async(req, res) => {
    const { limit, skip} = req.query;
    const lim = parseInt(limit) || 10;
    const skp = parseInt(skip) || 0;
    let count = await WithdrawlRequest.countDocuments({})
    WithdrawlRequest.find({})
    .populate("user","name email phone")
    .sort({"createdAt":-1})
    .limit(lim)
    .skip(skp)
    .exec((err, wReqs) => {
        if(err || !wReqs){
            return res.status(400).json({
                message: errorHandler(err)
            })
        }
        res.status(200).json({
            total:count,
            withdrawlRequests:wReqs
        })
    })
}

exports.updateStatus = async(req, res) => {
    const {status} = req.body;
    let WReq = req.WReq;
    let userId = WReq.user;
    User.findByIdAndUpdate(userId,{
        balance:0
    },(err, usr) => {
        if(err || !usr){
            return res.status(400).json({
                message:errorHandler(err)
            })
        }
        WReq.status=status;
        WReq.save((err, withRequest) => {
            if(err || !withRequest){
                return res.status(400).json({
                    message: "Unable to save"
                })
            }
            return res.status(200).json(withRequest);
        })
    })
}