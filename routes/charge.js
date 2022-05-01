const router = require('express').Router();

const { create,confirm,getAllChargingChargers,list,listChargeByUser } = require('../controllers/charge');
const { userById } = require('../controllers/user');

router.get("/list",list);
router.get("/list/:userId", listChargeByUser);
router.post("/create", create);
router.post("/confirm", confirm );
router.get("/charging-chargers", getAllChargingChargers);


router.param("userId",userById);


module.exports = router;