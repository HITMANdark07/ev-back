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
} = require("../controllers/admin");
const { userById, requireSignin, isAdmin } = require("../controllers/user");
const { findDeviceById } = require("../controllers/devices");

router.get("/today-revenue", requireSignin, isAdmin, getTodayRevenue);
router.get("/total-revenue", requireSignin, isAdmin, getTotalRevenue);
router.get("/revenue-bymonth", requireSignin, isAdmin, getRevenueDataByMonth);
router.get("/revenue-byyear", requireSignin, isAdmin, getRevenueByYear);
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
router.get("/charges", requireSignin, isAdmin, chargesTransactions);

router.get("/charge-boxes", requireSignin, isAdmin, chargeBoxes);

router.get("/devices", requireSignin, isAdmin, deviceDetails);

router.param("deviceId", findDeviceById);
router.param("userId", userById);

module.exports = router;
