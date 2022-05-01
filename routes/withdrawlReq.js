const router = require('express').Router();

const { create, updateStatus,findReqById } = require('../controllers/withdrawlReq');

router.post("/create", create);
router.put("/:requestId/status", updateStatus );

router.param("requestId",findReqById);

module.exports = router;