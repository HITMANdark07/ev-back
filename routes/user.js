const router = require("express").Router();

const {
  login,
  list,
  search,
  setOtp,
  verifyOtp,
  getProfile,
  userById,
  getPartnersProfile,
} = require("../controllers/user");

router.post("/login", login);
router.get("/user/get-profile/:userId", getProfile);
router.get("/user/list", list);
router.get("/user/search/list", search);
router.post("/user/send-otp", setOtp);
router.post("/user/verify-otp", verifyOtp);
router.get("/get-partner-profiles", getPartnersProfile);

router.param("userId", userById);

module.exports = router;
