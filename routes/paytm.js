const router = require('express').Router();

const { createOrder, generateChecksum, initiateTransaction, findOrderById, read, updateStatus } = require('../controllers/paytm');

router.get("/:orderId",read);
router.post("/create", createOrder,generateChecksum, initiateTransaction);
router.post("/status", updateStatus );

router.param("orderId",findOrderById);

module.exports = router;