const router = require('express').Router();
const { canRequest, createRequest, updateHostReqStatus, listUnverifiedRequests, listverifiedRequests } = require("../controllers/hostreq");

router.post("/check", canRequest);
router.post("/create", createRequest);
router.put("/update", updateHostReqStatus);
router.get("/list/unverified", listUnverifiedRequests);
router.get("/list/verified", listverifiedRequests);

module.exports = router;