const router = require("express").Router();

const {
  getTodayRevenue,
  getTotalRevenue,
  getRevenueDataByMonth,
  getBestPerformingChargerPoints,
  getPowerAndRevenueByMonth,
  chargesTransactions,
  chargeBoxes,
  deviceDetails,
  getRevenueByYear,
  getPowerUsedByYear,
  getChargingSessionsCategoryCount,
  getSuccessFullTransactionCount,
  getTotalDevices,
  getOperatorsWithDeviceData,
  getStationData,
} = require("../controllers/admin");
const { userById, requireSignin, isAdmin } = require("../controllers/user");
const { findDeviceById } = require("../controllers/devices");

router.get("/today-revenue", requireSignin, isAdmin, getTodayRevenue);
router.get("/total-revenue", requireSignin, isAdmin, getTotalRevenue);
router.get("/revenue-bymonth", requireSignin, isAdmin, getRevenueDataByMonth);
router.get("/revenue-byyear", requireSignin, isAdmin, getRevenueByYear);
router.get("/power-byyear", requireSignin, isAdmin, getPowerUsedByYear);
router.get(
  "/charging-sessions",
  requireSignin,
  isAdmin,
  getChargingSessionsCategoryCount
);
router.get(
  "/transaction-count",
  requireSignin,
  isAdmin,
  getSuccessFullTransactionCount
);
router.get("/total-devices", requireSignin, isAdmin, getTotalDevices);
router.get(
  "/best-performing",
  requireSignin,
  isAdmin,
  getBestPerformingChargerPoints
);
router.get(
  "/power-vs-revenue",
  requireSignin,
  isAdmin,
  getPowerAndRevenueByMonth
);
router.get(
  "/operators-with-devices",
  requireSignin,
  isAdmin,
  getOperatorsWithDeviceData
);
router.get("/station-data", requireSignin, isAdmin, getStationData);
router.get("/charges", requireSignin, isAdmin, chargesTransactions);

router.get("/charge-boxes", requireSignin, isAdmin, chargeBoxes);

router.get("/devices", requireSignin, isAdmin, deviceDetails);

router.param("deviceId", findDeviceById);
router.param("userId", userById);

module.exports = router;
