const router = require("express").Router();

const {
  create,
  getAllChargingChargers,
  list,
  listChargeByUser,
  getMonthStats,
  sendMessage,
  isConfirm,
  chargesByDevice,
  cancelChargeById,
  getChargeById,
  isChargeCanceled,
  updatePower,
  getYearStats,
  updatePowerV2,
  statusCount,
} = require("../controllers/charge");
const { userById, requireSignin, isUser } = require("../controllers/user");
const { findDeviceById } = require("../controllers/devices");

router.get("/list", list);
router.get("/list/:userId", listChargeByUser);
router.post("/create", create);
router.post("/power", updatePower);
router.post("/powerv2", updatePowerV2);

router.get("/list/device/:deviceId", chargesByDevice);
// router.post("/confirm", confirm );
router.get("/confirming/:chargeId", isConfirm);
router.get("/status/count/:userId", statusCount);
router.get("/charging-chargers", getAllChargingChargers);
// router.get("/device/status-check/:deviceId",deviceFindStatus);
router.put("/cancel/:chargeId", cancelChargeById);
router.get("/iscancel/:chargeId", isChargeCanceled);
router.post("/send-sms", sendMessage);

router.post("/stats/month", getMonthStats);
router.post("/stats/year", getYearStats);

router.param("deviceId", findDeviceById);
router.param("chargeId", getChargeById);
router.param("userId", userById);

module.exports = router;
