const Device = require("../models/device")
const mongoose = require('mongoose');
const Charge = require("../models/charge");

const { ObjectId } = mongoose.Types;

exports.getMyDevices = async(req, res) => {
    try{
        const { _id} = req.auth;
        const pipeline = [{
            $match: {
             owner: ObjectId(_id)
            }
           }, {
            $lookup: {
             from: 'charges',
             localField: '_id',
             foreignField: 'device',
             as: 'charges'
            }
           }, {
            $unwind: {
             path: '$charges',
             preserveNullAndEmptyArrays: false
            }
           }, {
            $group: {
             _id: '$_id',
             code: {
              $first: '$code'
             },
             location: {
              $first: '$location'
             },
             inuse: {
              $first: '$inuse'
             },
             device_type: {
              $first: '$device_type'
             },
             rate: {
              $first: '$rate'
             },
             members: {
              $first: '$members'
             },
             charges: {
              $sum: 1
             },
             revenue: {
              $sum: '$charges.amount'
             }
            }
           }]
        const deviceData = await Device.aggregate(pipeline);
        return res.status(200).json(deviceData);
    }catch(err){
        console.log(err)
        return res.status(400).json({
            message:'Something Went Wrong'
        })
    }
}

exports.getThisMonthAndLastMonthData = async(req, res) => {
    try{
        const { _id } = req.auth;
        const pipeline = [{
            $match: {
             owner: ObjectId(_id)
            }
           }, {
            $lookup: {
             from: 'charges',
             localField: '_id',
             foreignField: 'device',
             as: 'charges'
            }
           }, {
            $unwind: {
             path: '$charges',
             preserveNullAndEmptyArrays: false
            }
           }, {
            $match: {
             $or: [
              {
               'charges.status': 'CANCELED'
              },
              {
               'charges.status': 'CHARGED'
              }
             ]
            }
           }, {
            $group: {
             _id: {
              year: {
               $year: '$charges.createdAt'
              },
              month: {
               $month: '$charges.createdAt'
              }
             },
             revenue: {
              $sum: '$charges.amount'
             },
             charges: {
              $sum: 1
             }
            }
           }, {
            $sort: {
             '_id.year': -1,
             '_id.month': -1
            }
           }, {
            $addFields: {
             month: {
              $concat: [
               {
                $let: {
                 vars: {
                  monthsInString: [
                   '',
                   'Jan',
                   'Feb',
                   'Mar',
                   'Apr',
                   'May',
                   'Jun',
                   'Jul',
                   'Aug',
                   'Sep',
                   'Oct',
                   'Nov',
                   'Dec'
                  ]
                 },
                 'in': {
                  $arrayElemAt: [
                   '$$monthsInString',
                   '$_id.month'
                  ]
                 }
                }
               },
               '-',
               {
                $substr: [
                 '$_id.year',
                 0,
                 -1
                ]
               }
              ]
             }
            }
           }, {
            $limit: 2
           }]
        const data = await Device.aggregate(pipeline);
        return res.status(200).json(data);
    }catch(err){
        return res.status(400).json({
            message:'Something Went Wrong'
        })
    }
}

exports.myTotalRevenue = async(req, res) => {
    try{
        const { _id } = req.auth;
        const pipeline = [{
            $match: {
             owner: ObjectId(_id)
            }
           }, {
            $lookup: {
             from: 'charges',
             localField: '_id',
             foreignField: 'device',
             as: 'charges'
            }
           }, {
            $unwind: {
             path: '$charges',
             preserveNullAndEmptyArrays: false
            }
           }, {
            $match: {
             $or: [
              {
               'charges.status': 'CANCELED'
              },
              {
               'charges.status': 'CHARGED'
              }
             ]
            }
           }, {
            $group: {
             _id: '$owner',
             totalRevenue: {
              $sum: '$charges.amount'
             },
             charges: {
              $sum: 1
             }
            }
           }]
        const data = await Device.aggregate(pipeline);
        return res.status(200).json(data);
    }catch(err){
        return res.status(400).json({
            message:'Something Went Wrong'
        })
    }
}


exports.getCharges = async(req, res) => {
    try{
        const { limit=20, skip =0} = req.query;        

        const chages = await Charge.find({
            device: req.device._id,
        }).populate("user","name photo email phone activated")
        .sort({
            createdAt:-1
        })
        .skip(parseInt(skip))
        .limit(parseInt(limit));
        return res.status(200).json(chages);
    }catch(err){
        return res.status(400).json({
            message:'Something Went Wrong'
        })
    }
}