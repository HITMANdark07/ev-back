const router = require('express').Router();

const { deviceFindStatus, confirm,uploadToS3 } = require('../controllers/ping');

router.post("/",deviceFindStatus);
router.post("/cf",confirm);
router.post("/upload",uploadToS3);



module.exports = router;