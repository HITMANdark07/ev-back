const router = require('express').Router();

const { create, readQr,findQrByDevice } = require('../controllers/devices');
const { deviceValidator } = require('../validators/deviceValidator');

router.post("/create", deviceValidator , create);
router.get("/qr/image/:qrDevice", readQr);

router.param("qrDevice",findQrByDevice);

module.exports = router;