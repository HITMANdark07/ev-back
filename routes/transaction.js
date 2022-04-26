const { listTransactions } = require('../controllers/transaction');

const router = require('express').Router();

router.get("/list",listTransactions);

module.exports = router;