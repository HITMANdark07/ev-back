const router = require('express').Router();

const { create, readQr,findQrByDevice, list, findDeviceById, update, remove } = require('../controllers/devices');
const { deviceValidator } = require('../validators/deviceValidator');

router.post("/create", deviceValidator , create);
router.get("/list",list);
router.get("/qr/image/:qrDevice", readQr);
router.put("/update/:deviceId", update)
router.delete("/remove/:deviceId", remove);

router.param("qrDevice",findQrByDevice);
router.param("deviceId",findDeviceById);

module.exports = router;