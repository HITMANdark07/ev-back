const Order = require('../models/order');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const PaytmChecksum = require('paytmchecksum');
const Razorpay = require("razorpay");
const { validatePaymentVerification } = require('razorpay/dist/utils/razorpay-utils')
const axios = require('axios');
const { errorHandler } = require('../helpers/dbErrorHandler');


const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEYID, key_secret: process.env.RAZORPAY_KEY_SECRET });

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


exports.createOrder = async(req, res, next) => {
        
    try{
        const { userId, amount } = req.body;
        const ord = await razorpay.orders.create({
            amount: Number(amount),
            currency: "INR",
        })
        if(ord.id){
            const order = new Order({
                user:userId,
                amount:amount,
                orderId:ord.id
            });
            order.save((err, ord) => {
                if(err || !ord){
                    return res.status(400).json({
                        message:'Order Creation Failed'
                    })
                }
                return res.json(ord)
            })
        }
    }catch(err){
        console.log(err);
        if(err?.error?.description){
            return res.status(400).json({
                message:err.error.description
            })
        }else{
            return res.status(400).json({
                message:err?.message
            })
        }
        
    }
}

exports.updateOrder = async(req, res, next) => {
    try{
        const { orderId, razorpay_payment_id, razorpay_signature } = req.body;
        const order = await Order.findById(orderId);
        order.paymentId = razorpay_payment_id;
        order.paymentSignature = razorpay_signature;
        order.save((err, ord) => {
            if(err){
                return res.status(400).json({
                    message: 'Order updation failed'
                })
            }
            req.order = ord;
            next();
        })
    }catch(err){
        return res.status(400).json({
            message:'OrderId is invalid'
        })
    }
}

exports.verify = async(req, res) => {
    try{
        console.log("verifying...");
        const { razorpay_payment_id,razorpay_order_id, razorpay_signature } = req.body;
        let order = req.order;
        const isPaymentValid =  validatePaymentVerification({"order_id": razorpay_order_id, "payment_id": razorpay_payment_id }, razorpay_signature, process.env.RAZORPAY_KEY_SECRET);
        console.log(isPaymentValid,order,"isPaymentValid");
        if(isPaymentValid){
            order.status = 'SUCCESS';
            await order.save();
            return res.status({
                success:true
            })
        }else{
            order.status = 'FAILED';
            await order.save();
            return res.status({
                success:false
            })
        }
    }catch(err){
        console.log(err);
        return res.status(400).json({
            message:err.message
        })
    }
}
