const router = require('express').Router();

const { create, updateStatus,findReqById, list } = require('../controllers/withdrawlReq');

router.get("/list",list);
router.post("/create", create);
router.put("/:requestId/status", updateStatus );

router.param("requestId",findReqById);

module.exports = router;