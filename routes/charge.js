const router = require('express').Router();

const { create,confirm,getAllChargingChargers,list } = require('../controllers/charge');

router.get("/list",list);
router.post("/create", create);
router.post("/confirm", confirm );
router.get("/charging-chargers", getAllChargingChargers);


module.exports = router;