const router = require('express').Router();

const { login, list, search, setOtp, verifyOtp } = require('../controllers/user');

router.post("/login", login);
router.get("/user/list",list);
router.get("/user/search/list",search);
router.post("/user/send-otp", setOtp);
router.post("/user/verify-otp", verifyOtp);

module.exports = router;