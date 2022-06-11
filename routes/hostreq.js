const router = require('express').Router();
const { canRequest, createRequest, updateHostReqStatus } = require("../controllers/hostreq");

router.post("/check", canRequest);
router.post("/create", createRequest);
router.put("/update", updateHostReqStatus);

module.exports = router;