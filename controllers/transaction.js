const Order = require('../models/order');
const { errorHandler } = require('../helpers/dbErrorHandler');

exports.listTransactions = async(req, res) => {
    const { limit, skip} = req.query;
    let count = await Order.countDocuments({})
    let transactions = await Order.find({}).limit(limit).skip(skip).sort({'createdAt':-1});
    res.status(200).json({
        total:count,
        transactions:transactions
    })
}