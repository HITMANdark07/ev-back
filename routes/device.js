const router = require('express').Router();

const { create, readQr,findQrByDevice, list, findDeviceById, update, remove, listDevicesByUser } = require('../controllers/devices');
const { userById }  = require('../controllers/user');
const { deviceValidator } = require('../validators/deviceValidator');

router.post("/create", deviceValidator , create);
router.get("/list",list);
router.get("/list/:userId", listDevicesByUser);
router.get("/qr/image/:qrDevice", readQr);
router.put("/update/:deviceId", update)
router.delete("/remove/:deviceId", remove);

router.param("userId", userById);
router.param("qrDevice",findQrByDevice);
router.param("deviceId",findDeviceById);

module.exports = router;