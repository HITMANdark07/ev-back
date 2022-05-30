const router = require('express').Router();

const { deviceFindStatus, confirm } = require('../controllers/ping');

router.post("/",deviceFindStatus);
router.post("/cf",confirm);



module.exports = router;