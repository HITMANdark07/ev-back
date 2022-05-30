const router = require('express').Router();

const { create,getAllChargingChargers,list,listChargeByUser, sendMessage, isConfirm } = require('../controllers/charge');
const { userById } = require('../controllers/user');

router.get("/list",list);
router.get("/list/:userId", listChargeByUser);
router.post("/create", create);
// router.post("/confirm", confirm );
router.get("/confirming/:chargeId", isConfirm );
router.get("/charging-chargers", getAllChargingChargers);
// router.get("/device/status-check/:deviceId",deviceFindStatus);
router.post("/send-sms", sendMessage);
router.param("userId",userById);


module.exports = router;