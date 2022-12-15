const router = require('express').Router();

const { verify } = require('jsonwebtoken');
const { createOrder, findOrderById, read, updateOrder,verify } = require('../controllers/razorpay');

router.get("/:orderId",read);
router.post("/initiate",createOrder);
router.post("/verify",updateOrder, verify);

router.param("orderId",findOrderById);

module.exports = router;