const router = require('express').Router();
const { canRequest } = require("../controllers/hostreq");

router.post("/check", canRequest);

module.exports = router;