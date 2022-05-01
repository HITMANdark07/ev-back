const { listTransactions, listTransactionsByUser } = require('../controllers/transaction');
const { userById } = require('../controllers/user');
const router = require('express').Router();

router.get("/list",listTransactions);
router.get("/list/:userId", listTransactionsByUser);

router.param("userId", userById);

module.exports = router;