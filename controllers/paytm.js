const Order = require('../models/order');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const PaytmChecksum = require('paytmchecksum');
const axios = require('axios');
const { errorHandler } = require('../helpers/dbErrorHandler');


exports.findOrderById = (req,res, next, id) => {
    Order.findById(id)
    .exec((err, order) => {
        if(err || !order){
            return res.status(400).json({
                error:"Order Unavailable"
            })
        }
        req.order= order;
        next();
    })
}

exports.read = (req, res)=>{
    return res.json(req.order);
};


exports.createOrder = (req, res, next) => {
    const { userId, amount } = req.body;
    const order = new Order({
        user:userId,
        amount:amount
    })
    order.save((err, ord) => {
        if(err || !ord){
            return res.status(400).json({
                message:'Order Creation Failed'
            })
        }
        req.order = ord;
        next();
    })
}

exports.generateChecksum = (req, res, next) => {
    const { user, amount, _id } = req.order;
    const paytmParams = {
        requestType   : "Payment",
        mid           : `${process.env.PAYTM_MERCHANT_ID}`,
        websiteName   : "EROEV",
        orderId       : _id,
        callbackUrl   : process.env.PAYTM_CALLBACK_PRODUCTION_URL+_id,
        txnAmount     : {
            value     : parseFloat(amount).toFixed(2),
            currency  : "INR",
        },
        userInfo      : {
            custId    : user,
        },
        enablePaymentMode:[{
            mode : "UPI", 
            channels : ["UPI", "UPIPUSH","UPIPUSHEXPRESS"]
        },
        {
            mode:"BALANCE"
        },
        {
            mode:"DEBIT_CARD",
            channels: ["VISA", "MASTER", "AMEX"]
        }]
    }
    req.paytmParams = paytmParams;
    PaytmChecksum.generateSignature(JSON.stringify(paytmParams),process.env.PAYTM_MERCHANT_KEY).then((checksum) => {
        req.checksum = checksum;
        next();
    }).catch((err) => {
        return res.status(400).json({
            message:'Checksum generation Failed'
        })
    })
} 

exports.initiateTransaction = (req, res) => {
    const { paytmParams,checksum, order:{ _id } }  = req;
    const params = {
        body:paytmParams,
        head:{
            signature: checksum
        }
    }
    axios({
        method:'POST',
        url:`${process.env.PAYTM_INITIATE_TRANSACTION_PRODUCTION_API}?mid=${process.env.PAYTM_MERCHANT_ID}&orderId=${_id}`,
        data:params
    }).then(({data}) => {
        res.status(200).json({
            orderId:_id,
            tranxToken:data.body.txnToken,
        });
    }).catch((err) => {
        console.log(err);
        res.status(400).json({
            message:'Initiating Transaction Failed'
        })
    })
}

exports.updateStatus = async(req, res) => {
    const { orderId, checksum, success, amount} = req.body;
    try{  
        const order = await Order.findById(orderId);
    
        if(success){
            order.status="SUCCESS";
            await order.save();
            const user = await User.findById(order.user);
            user.balance = user.balance+Number(amount);
            user.save(async(err,user) => {
                if(err){
                    return res.status(400).json({
                        error: errorHandler(err)
                    })
                }
                const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET);
                res.cookie('t', token, {expire: new Date() + 9999})
                await res.json({
                        token,
                        user:user
                    });
            })
        }else{
            order.status="FAIL";
            await order.save();
            const user = await User.findById(order.user);
            const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET);
            res.cookie('t', token, {expire: new Date() + 9999})
            await res.json({
                    token,
                    user:user
                });
        }

        
    }catch(err){
        console.log(err);
        return res.status(400).json({
            message:'Something Went Wrong'
        })
    }
    
}

