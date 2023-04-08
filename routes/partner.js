const router = require('express').Router();

const {  getMyDevices, getThisMonthAndLastMonthData, getCharges, myTotalRevenue} = require('../controllers/partner');
const { userById,requireSignin, isUser, isPartner  } = require('../controllers/user');
const { findDeviceById } = require("../controllers/devices");

router.get('/my-devices',requireSignin,isPartner, getMyDevices);
router.get('/my-monthly-stats',requireSignin,isPartner,getThisMonthAndLastMonthData );
router.get('/my-total-revenue', requireSignin, isPartner, myTotalRevenue);
router.get('/device-charges/:deviceId', requireSignin, isPartner,getCharges );


router.param("deviceId", findDeviceById);
router.param("userId",userById);


module.exports = router;