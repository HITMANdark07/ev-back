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
          total_charges: {
            $sum: 1,
          },
        },
      },
      {
        $addFields: {
          profitRate: {
            $round: [
              {
                $divide: ["$revenue", "$total_charges"],
              },
              2,
            ],
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
