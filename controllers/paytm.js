const Order = require('../models/order');
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
        websiteName   : "WEBSTAGING",
        orderId       : _id,
        callbackUrl   : "https://evcharge-back.herokuapp.com/api/transaction/status",
        txnAmount     : {
            value     : amount,
            currency  : "INR",
        },
        userInfo      : {
            custId    : user,
        },
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
        url:`${process.env.PAYTM_INITIATE_TRANSACTION_STATGING_API}?mid=${process.env.PAYTM_MERCHANT_ID}&orderId=${_id}`,
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

exports.updateStatus = (req, res) => {
    console.log(req);
    res.status(200).json({
        success:true
    })
}

