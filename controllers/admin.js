const Device = require("../models/device");
const mongoose = require("mongoose");
const Charge = require("../models/charge");

const { ObjectId } = mongoose.Types;

exports.getTodayRevenue = async (req, res) => {
  try {
    const today = new Date();
    const pipeline = [
      {
        $match: {
          createdAt: {
            $gte: new Date(
              `${today.getMonth()}/${today.getDate()}/${today.getFullYear()}`
            ),
          },
          confirm: true,
        },
      },
      {
        $group: {
          _id: "$confirm",
          total: {
            $sum: "$amount",
          },
        },
      },
    ];
    const data = await Charge.aggregate(pipeline);
    return res.status(200).json({
      total: data[0]?.total ?? 0,
    });
  } catch (err) {
    return res.status(400).json({
      message: "Something Went Wrong",
    });
  }
};

exports.getTotalRevenue = async (req, res) => {
  try {
    const today = new Date();
    const pipeline = [
      {
        $match: {
          confirm: true,
        },
      },
      {
        $group: {
          _id: "$confirm",
          total: {
            $sum: "$amount",
          },
        },
      },
    ];
    const data = await Charge.aggregate(pipeline);
    return res.status(200).json({
      total: data[0]?.total ?? 0,
    });
  } catch (err) {
    return res.status(400).json({
      message: "Something Went Wrong",
    });
  }
};

exports.getRevenueDataByMonth = async (req, res) => {
  try {
    const pipeline = [
      {
        $match: {
          confirm: true,
        },
      },
      {
        $group: {
          _id: {
            year: {
              $year: "$createdAt",
            },
            month: {
              $month: "$createdAt",
            },
          },
          revenue: {
            $sum: "$amount",
          },
        },
      },
      {
        $sort: {
          "_id.year": -1,
          "_id.month": -1,
        },
      },
      {
        $addFields: {
          month: {
            $concat: [
              {
                $let: {
                  vars: {
                    monthInString: [
                      "",
                      "Jan",
                      "Feb",
                      "Mar",
                      "Apr",
                      "May",
                      "Jun",
                      "Jul",
                      "Aug",
                      "Sep",
                      "Oct",
                      "Nov",
                      "Dec",
                    ],
                  },
                  in: {
                    $arrayElemAt: ["$$monthInString", "$_id.month"],
                  },
                },
              },
              "-",
              {
                $substr: ["$_id.year", 0, -1],
              },
            ],
          },
        },
      },
    ];
    const data = await Charge.aggregate(pipeline);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(400).json({
      message: "Something Went Wrong",
    });
  }
};

exports.getBestPerformingChargerPoints = async (req, res) => {
  try {
    const pipeline = [
      {
        $match: {
          confirm: true,
        },
      },
      {
        $lookup: {
          from: "devices",
          localField: "device",
          foreignField: "_id",
          as: "device",
        },
      },
      {
        $unwind: {
          path: "$device",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $group: {
          _id: "$device._id",
          device: {
            $first: "$device",
          },
          revenue: {
            $sum: "$amount",
          },
          power_used: {
            $sum: "$powerUsed",
          },
        },
      },
      {
        $addFields: {
          profitRate: {
            $round: [
              {
                $divide: ["$revenue", "$power_used"],
              },
              2,
            ],
          },
          total_power: {
            $round: ["$power_used", 2],
          },
        },
      },
      {
        $sort: {
          profitRate: -1,
        },
      },
      {
        $project: {
          device_code: "$device.code",
          total_revenue: "$revenue",
          profit_rate: "$profitRate",
          total_power: 1,
        },
      },
      {
        $limit: 3,
      },
    ];
    const data = await Charge.aggregate(pipeline);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(400).json({
      message: "Something Went Wrong",
    });
  }
};

exports.getPowerAndRevenueByMonth = async (req, res) => {
  try {
    const pipeline = [
      {
        $match: {
          confirm: true,
        },
      },
      {
        $group: {
          _id: {
            month: {
              $month: "$createdAt",
            },
            year: {
              $year: "$createdAt",
            },
          },
          total_revenue: {
            $sum: "$amount",
          },
          total_power: {
            $sum: "$powerUsed",
          },
        },
      },
      {
        $addFields: {
          month: {
            $concat: [
              {
                $let: {
                  vars: {
                    monthInString: [
                      "",
                      "Jan",
                      "Feb",
                      "Mar",
                      "Apr",
                      "May",
                      "Jun",
                      "Jul",
                      "Aug",
                      "Sep",
                      "Oct",
                      "Nov",
                      "Dec",
                    ],
                  },
                  in: {
                    $arrayElemAt: ["$$monthInString", "$_id.month"],
                  },
                },
              },
              "-",
              {
                $substr: ["$_id.year", 0, -1],
              },
            ],
          },
        },
      },
      {
        $sort: {
          "_id.year": -1,
          "_id.month": -1,
        },
      },
      {
        $project: {
          total_revenue: 1,
          total_power: 2,
          date: "$month",
          year: "$_id.year",
          month: "$_id.month",
        },
      },
    ];
    const data = await Charge.aggregate(pipeline);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(400).json({
      message: "Something went wrong",
    });
  }
};

exports.chargesTransactions = async (req, res) => {
  try {
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const pipeline = [
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "client",
        },
      },
      {
        $unwind: {
          path: "$client",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ];
    const charges = await Charge.aggregate(pipeline).exec();
    return res.status(200).json(charges);
  } catch (err) {
    return res.status(400).json({
      message: "Something Went Wrong",
    });
  }
};

exports.chargeBoxes = async (req, res) => {
  try {
    const total_power_pipline = [
      {
        $match: {
          $or: [
            {
              status: "CHARGED",
            },
            {
              status: "CANCELED",
            },
          ],
        },
      },
      {
        $group: {
          _id: "",
          total_power: {
            $sum: "$powerUsed",
          },
        },
      },
    ];
    const power = await Charge.aggregate(total_power_pipline).exec();
    const total_power = power[0].total_power;
    const total_transactions = await Charge.count({
      $or: [
        {
          status: "CHARGED",
        },
        {
          status: "CANCELED",
        },
      ],
    });
    const devices = await Device.count({
      isDeleted: false,
    });
    return res.status(200).json({
      total_power,
      transactions: total_transactions,
      device_count: devices,
    });
  } catch (err) {
    return res.status(400).json({
      message: "Something Went Wrong",
    });
  }
};

exports.deviceDetails = async (req, res) => {
  try {
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const Devices = await Device.find({
      isDeleted: false,
    })
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit);
    return res.status(200).json(Devices);
  } catch (err) {
    return res.status(400).json({
      message: "Something Went Wrong",
    });
  }
};

exports.getRevenueByYear = async (req, res) => {
  try {
    const pipeline = [
      { $match: { confirm: true } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" } },
          revenue: { $sum: "$amount" },
        },
      },
      { $addFields: { year: "$_id.year" } },
    ];
    const data = await Charge.aggregate(pipeline).exec();
    return res.status(200).json(data);
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      message: "Something Went Wrong",
    });
  }
};

exports.getPowerUsedByYear = async (req, res) => {
  try {
    const pipeline = [
      { $match: { confirm: true } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" } },
          power: { $sum: "$powerUsed" },
        },
      },
      { $addFields: { year: "$_id.year" } },
    ];
    const data = await Charge.aggregate(pipeline).exec();
    return res.status(200).json(data);
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      message: "Something went wrong",
    });
  }
};

exports.getChargingSessionsCategoryCount = async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: "$status",
          total: { $sum: 1 },
        },
      },
    ];
    const data = await Charge.aggregate(pipeline).exec();
    return res.status(200).json(data);
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      message: "Something Went Wrong",
    });
  }
};

exports.getSuccessFullTransactionCount = async (req, res) => {
  try {
    const data = await Charge.count({
      confirm: true,
    });
    return res.status(200).json({
      transaction_count: data,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      message: "Something Went Wrong",
    });
  }
};

exports.getTotalDevices = async (req, res) => {
  try {
    const data = await Device.count({
      isDeleted: false,
    });
    return res.status(200).json({
      device_count: data,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      message: "Something Went Wrong",
    });
  }
};

exports.getOperatorsWithDeviceData = async (req, res) => {
  try {
    const pipeline = [
      { $match: { confirm: true } },
      {
        $lookup: {
          from: "devices",
          localField: "device",
          foreignField: "_id",
          as: "chargebox",
        },
      },
      {
        $unwind: {
          path: "$chargebox",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "chargebox.owner",
          foreignField: "_id",
          as: "owner",
        },
      },
      {
        $unwind: {
          path: "$owner",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $group: {
          _id: "$chargebox._id",
          device_id: { $first: "$chargebox._id" },
          deviceCode: { $first: "$deviceCode" },
          owner: { $first: "$owner" },
          power: { $sum: "$powerUsed" },
          revenue: { $sum: "$amount" },
        },
      },
      {
        $group: {
          _id: "$owner._id",
          name: { $first: "$owner.name" },
          email: { $first: "$owner.email" },
          photo: { $first: "$owner.photo" },
          balance: { $first: "$owner.balance" },
          devices: {
            $push: {
              deviceCode: "$deviceCode",
              device_id: "$device_id",
              power: "$power",
              revenue: "$revenue",
            },
          },
        },
      },
    ];
    const data = await Charge.aggregate(pipeline).exec();
    return res.status(200).json(data);
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      message: "Something Went Wrong",
    });
  }
};

exports.getStationData = async (req, res) => {
  try {
    const pipeline = [
      { $match: { confirm: true } },
      {
        $lookup: {
          from: "devices",
          localField: "device",
          foreignField: "_id",
          as: "device",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "device.owner",
          foreignField: "_id",
          as: "owner",
        },
      },
      {
        $group: {
          _id: "$deviceCode",
          power: { $sum: "$powerUsed" },
          revenue: { $sum: "$amount" },
          device: { $first: "$device" },
          owner: { $first: "$owner" },
        },
      },
      {
        $unwind: {
          path: "$device",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $unwind: {
          path: "$owner",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          power: 1,
          revenue: 1,
          device: {
            _id: 1,
            code: 1,
            location: { lat: 1, lng: 1 },
            rate: 1,
          },
          owner: { name: 1, email: 1, photo: 1 },
        },
      },
    ];
    const data = await Charge.aggregate(pipeline);
    return res.status(200).json(data);
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      message: "Something Went Wrong",
    });
  }
};
