const router = require('express').Router();

const { create, readQr,findQrByDevice, list } = require('../controllers/devices');
const { deviceValidator } = require('../validators/deviceValidator');

router.post("/create", deviceValidator , create);
router.get("/list",list);
router.get("/qr/image/:qrDevice", readQr);

router.param("qrDevice",findQrByDevice);

module.exports = router;