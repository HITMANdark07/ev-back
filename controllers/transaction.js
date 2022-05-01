const Order = require('../models/order');
const { errorHandler } = require('../helpers/dbErrorHandler');

exports.listTransactions = async(req, res) => {
    const { limit, skip} = req.query;
    let count = await Order.countDocuments({})
    Order.find({})
    .populate("user","name email phone")
    .sort({"createdAt":-1})
    .limit(parseInt(limit))
    .skip(parseInt(skip))
    .exec((err, orders) => {
        if(err || !orders){
            return res.status(400).json({
                message: errorHandler(err)
            })
        }
        res.status(200).json({
            total:count,
            transactions:orders
        })
    })
}

exports.listTransactionsByUser = async(req, res) => {
    const { limit, skip} = req.query;
    let count = await Order.countDocuments({user:req.profile._id})
    Order.find({user:req.profile._id})
    .populate("user","name email phone")
    .sort({"createdAt":-1})
    .limit(parseInt(limit))
    .skip(parseInt(skip))
    .exec((err, orders) => {
        if(err || !orders){
            return res.status(400).json({
                message: errorHandler(err)
            })
        }
        res.status(200).json({
            total:count,
            transactions:orders
        })
    })
}